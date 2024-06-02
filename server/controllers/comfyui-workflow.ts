import { Strapi } from '@strapi/strapi';
import axios from 'axios';

export default ({ strapi }: { strapi: Strapi }) => ({
  async index(ctx) {
    const workflows = await strapi
      .plugin('strapi-plugin-comfyui')
      .service('comfyuiWorkflow')
      .getIndex();
    ctx.body = workflows;
  },

  async createQueue(ctx) {
    // get params from request body
    const { positive_prompts, workflow, images = [] } = ctx.request.body;

    // call create comfyui queue service
    ctx.body = await strapi
      .plugin('strapi-plugin-comfyui')
      .service('comfyuiWorkflow')
      .createQueue({ positive_prompts, workflow, images });
  },

  async createQueueV2(ctx) {
    // get params from request body
    const { workflow_id: workflowId, template } = ctx.request.body;

    // call create comfyui queue service
    try {
      ctx.body = await strapi
      .plugin('strapi-plugin-comfyui')
      .service('comfyuiWorkflow')
      .createQueueV2({ workflowId, template });
    } catch (error) {
      return error;
    }
  },

  async history(ctx) {
    const { prompt_id } = ctx.params;
    console.log('prompt_id', prompt_id);
    ctx.body = await strapi
      .plugin('strapi-plugin-comfyui')
      .service('comfyuiWorkflow')
      .getHistory({ prompt_id });
  },

  async view(ctx) {
    const { filename, subfolder, type } = ctx.query;

    // get comfyui config
    const config = strapi.config.get<{ comfyui: { host: string; port: number } }>(
      'plugin.strapi-plugin-comfyui'
    );

    // send prompts and workflow to comfyui server
    try {
      const imgUrl =
        `http://${config.comfyui.host}:${config.comfyui.port}/view?` +
        `filename=${filename}&subfolder=${subfolder}&type=${type}`;

      // return the remote image binary
      const response = await axios.get(imgUrl, {
        responseType: 'stream',
      });

      ctx.set('Content-Type', response.headers['content-type']);
      ctx.status = response.status;
      ctx.body = response.data; // Stream the image data

      return ctx;
    } catch (error) {
      return error;
    }
  },
});
