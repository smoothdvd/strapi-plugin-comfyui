import { Strapi } from '@strapi/strapi';
import axios from 'axios';
import crypto from 'crypto';

function getRandomNumber(min, max) {
  const range = max - min + 1;
  const randomBytes = crypto.randomBytes(Math.ceil(Math.log2(range) / 8));

  let randomNumber = 0;
  randomBytes.forEach((byte) => {
    randomNumber = randomNumber * 256 + byte;
  });

  // Ensure the number falls within the specified range
  return min + (randomNumber % range);
}

export default ({ strapi }: { strapi: Strapi }) => ({
  async getIndex() {
    let entries;
    try {
      entries = await strapi.entityService!.findMany(
        'plugin::strapi-plugin-comfyui.comfyui-workflow',
        {
          populate: { preview: true },
        }
      );
    } catch (error) {
      strapi.log.error(error);
      return error;
    }
    return entries;
  },

  async createQueue({ positive_prompts, workflow }) {
    strapi.log.info('send workflow queue to comfyui server');

    let newWorkflow: Record<string, any> = workflow;

    // generate random number which lenght is 15, using crypto
    const seed = getRandomNumber(10 ** 14, 10 ** 15 - 1);

    // workflow is object, so we need to loop through it
    for (const key in newWorkflow) {
      if (newWorkflow.hasOwnProperty(key)) {
        const element = newWorkflow[key];

        // if element has class_type KSampler,
        if (element.hasOwnProperty('class_type')) {
          if (element.class_type === 'KSampler') {
            // change seed value in inputs
            element['inputs']['seed'] = seed;

            // get key of the positive prompts in the inputs
            const positivePromptKey = element['inputs']['positive'][0];

            // if positive prompt key is found, change the value of the positive prompt with the positive_prompts value
            if (positivePromptKey) {
              newWorkflow[positivePromptKey]['inputs']['text'] = positive_prompts;
            }
          }
        }
      }
    }

    // get comfyui config
    const config = strapi.config.get<{ comfyui: { host: string; port: number } }>(
      'plugin.strapi-plugin-comfyui'
    );

    // send prompts and workflow to comfyui server

    try {
      const response = await axios.post(
        `http://${config.comfyui.host}:${config.comfyui.port}/prompt`,
        {
          prompt: workflow,
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      return error;
    }
  },

  async getHistory({ prompt_id }) {
    // get comfyui config
    const config = strapi.config.get<{ comfyui: { host: string; port: number } }>(
      'plugin.strapi-plugin-comfyui'
    );

    // send prompts and workflow to comfyui server
    try {
      const response = await axios.get(
        `http://${config.comfyui.host}:${config.comfyui.port}/history/${prompt_id}`
      );
      const { data } = response;
      if (Object.keys(data).length === 0) {
        return { message: 'No history found' };
      } else {
        // omit prompt key from the response
        delete data[`${prompt_id}`]['prompt'];
      }
      return data;
    } catch (error) {
      return error;
    }
  },
});
