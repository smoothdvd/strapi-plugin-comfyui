export default {
  kind: 'collectionType',
  collectionName: 'comfyui_workflow',
  info: {
    singularName: 'comfyui-workflow', // kebab-case mandatory
    pluralName: 'comfyui-workflows', // kebab-case mandatory
    displayName: 'Comfyui Workflow',
    description: 'Workflow for ComfyUI include name and description, etc.',
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {
    'content-manager': {
      visible: true,
    },
    'content-type-builder': {
      visible: false,
    },
  },
  attributes: {
    name: {
      type: 'string',
      min: 1,
      max: 50,
      required: true,
      configurable: false,
    },
    description: {
      type: 'text',
      configurable: false,
    },
    workflow: {
      type: 'json',
      required: true,
      configurable: false,
    },
    preview: {
      type: 'media',
      multiple: false,
      allowedTypes: ['images'],
      required: true,
      configurable: false,
    },
    allowInputImage: {
      type: 'boolean',
      default: false,
      required: true,
      configurable: false,
    },
    runs: {
      type: 'integer',
      default: 0,
      min: 0,
      required: true,
      configurable: false,
    },
    template: {
      type: 'json',
      required: false,
      configurable: false,
    }
  },
};
