export default {
  default: ({ env }) => ({
    comfyui: {
      host: '127.0.0.1',
      port: 8188,
    },
  }),
  validator: (config) => {
    if (typeof config.comfyui.host !== 'string') {
      throw new Error('host has to be a string');
    }
    if (typeof config.comfyui.port !== 'number') {
      throw new Error('port has to be a number');
    }
  },
};
