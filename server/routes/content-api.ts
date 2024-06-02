export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/comfyui/workflows',
      handler: 'comfyuiWorkflow.index',
    },
    {
      method: 'POST',
      path: '/comfyui/queue',
      handler: 'comfyuiWorkflow.createQueue',
    },
    {
      method: 'POST',
      path: '/comfyui/queuev2',
      handler: 'comfyuiWorkflow.createQueueV2',
    },
    {
      method: 'GET',
      path: '/comfyui/history/:prompt_id',
      handler: 'comfyuiWorkflow.history',
    },
    {
      method: 'GET',
      path: '/comfyui/view',
      handler: 'comfyuiWorkflow.view',
    },
  ],
};
