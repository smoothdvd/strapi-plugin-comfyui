import { Strapi } from '@strapi/strapi';
import axios from 'axios';
import crypto from 'crypto';

function getRandomNumber(min: number, max: number) {
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
  async getIndex({ category }: { category?: string }) {
    let entries;
    try {
      entries = await strapi.entityService!.findMany(
        'plugin::strapi-plugin-comfyui.comfyui-workflow',
        {
          populate: { preview: true },
          fields: ['id', 'name', 'description', 'category', 'allowInputImage', 'runs', 'template'],
          filters: {
            publishedAt: {
              $notNull: true,
            },
            ...(category && { category }),
          },
          sort: 'id:asc',
        }
      );
    } catch (error) {
      strapi.log.error(error);
      return error;
    }
    return entries;
  },

  async createQueue({
    positive_prompts,
    workflow,
    images,
  }: {
    positive_prompts: string;
    workflow: Record<string, any>;
    images: string[];
  }) {
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
            if (element['inputs']['positive']) {
              const positivePromptKey = element['inputs']['positive'][0];

              // if positive prompt key is found, check if the element has inputs text key
              if (positivePromptKey) {
                if (newWorkflow[positivePromptKey]['inputs'].hasOwnProperty('text')) {
                  // change the value of the text with the positive prompts value
                  newWorkflow[positivePromptKey]['inputs']['text'] = positive_prompts;
                } else {
                  // find next element which has inputs text key
                  const nextPositivePromptKey = (newWorkflow[positivePromptKey]['inputs'][
                    'positive'
                  ] || newWorkflow[positivePromptKey]['inputs']['base_positive'])[0];
                  if (nextPositivePromptKey) {
                    if (newWorkflow[nextPositivePromptKey]['inputs'].hasOwnProperty('text')) {
                      // change the value of the text with the positive prompts value
                      newWorkflow[nextPositivePromptKey]['inputs']['text'] = positive_prompts;
                    }
                  }
                }
              }
            }
          }

          if (element.class_type === 'KSamplerAdvanced') {
            // change seed value in inputs
            element['inputs']['noise_seed'] = getRandomNumber(10 ** 14, 10 ** 15 - 1);

            // get key of the positive prompts in the inputs
            if (element['inputs']['positive']) {
              const positivePromptKey = element['inputs']['positive'][0];

              // if positive prompt key is found, check if the element has inputs text key
              if (positivePromptKey) {
                if (newWorkflow[positivePromptKey]['inputs'].hasOwnProperty('text')) {
                  // change the value of the text with the positive prompts value
                  newWorkflow[positivePromptKey]['inputs']['text'] = positive_prompts;
                } else {
                  // find next element which has inputs text key
                  const nextPositivePromptKey = (newWorkflow[positivePromptKey]['inputs'][
                    'positive'
                  ] || newWorkflow[positivePromptKey]['inputs']['base_positive'])[0];
                  if (nextPositivePromptKey) {
                    if (newWorkflow[nextPositivePromptKey]['inputs'].hasOwnProperty('text')) {
                      // change the value of the text with the positive prompts value
                      newWorkflow[nextPositivePromptKey]['inputs']['text'] = positive_prompts;
                    }
                  }
                }
              }
            }
          }
        }

        if (images.length > 0) {
          // if element has class_type "Image Load"
          if (element.hasOwnProperty('class_type')) {
            if (element.class_type === 'Image Load') {
              // change the value of the image with the images value
              element['inputs']['image_path'] = images[0];
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

  // enhance version of create comyfui queue
  async createQueueV2({
    workflowId,
    template,
  }: {
    workflowId: number;
    template: Record<string, any>;
  }) {
    let newWorkflow;
    try {
      // Get workflow by workflowId
      const workflow = await strapi.entityService!.findOne(
        'plugin::strapi-plugin-comfyui.comfyui-workflow',
        workflowId
      );

      if (!workflow) {
        return { message: 'Workflow not found' };
      }

      // iterate through the template and update the workflow
      template.inputs.nodes.forEach((node: Record<string, any>) => {
        const oldNode = workflow.workflow[node.nodeId];
        const newNode = {
          ...oldNode,
          inputs: {
            ...oldNode.inputs,
            [node.fieldName]: node.fieldValue,
          },
        };
        console.log(JSON.stringify(newNode));
        workflow.workflow[node.nodeId] = newNode;
      });

      // set random seed
      const globalSeed = getRandomNumber(10 ** 14, 10 ** 15 - 1);

      // iterate through the workflow and update the seed
      workflow.template.seeds.nodes.forEach((node: Record<string, any>) => {
        const oldNode = workflow.workflow[node.nodeId];
        const newNode = {
          ...oldNode,
          inputs: {
            ...oldNode.inputs,
            [node.fieldName]:
              node.type === 'global' ? globalSeed : getRandomNumber(10 ** 14, 10 ** 15 - 1),
          },
        };
        workflow.workflow[node.nodeId] = newNode;
      });

      newWorkflow = workflow.workflow;

      // get comfyui config
      const config = strapi.config.get<{ comfyui: { host: string; port: number } }>(
        'plugin.strapi-plugin-comfyui'
      );

      // send prompts and workflow to comfyui server
      // return await axios.post(
      //   `http://${config.comfyui.host}:${config.comfyui.port}/prompt`,
      //   {
      //     prompt: workflow.workflow,
      //   }
      // );
    } catch (error) {
      return error;
    }

    try {
      // get comfyui config
      const config = strapi.config.get<{ comfyui: { host: string; port: number } }>(
        'plugin.strapi-plugin-comfyui'
      );

      const response = await axios.post(
        `http://${config.comfyui.host}:${config.comfyui.port}/prompt`,
        {
          prompt: newWorkflow,
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      return error;
    }
  },

  async getHistory({ prompt_id }: { prompt_id: string }) {
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
