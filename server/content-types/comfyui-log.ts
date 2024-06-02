export default {
  kind: 'collectionType',
  collectionName: 'comfyui_logs',
  info: {
    singularName: 'comfyui-log', // kebab-case mandatory
    pluralName: 'comfyui-logs', // kebab-case mandatory
    displayName: 'Comfyui Log',
    description: 'Log for ComfyUI workflow execute.',
  },
  options: {
    draftAndPublish: false,
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
    loggable_id: {
      type: 'integer',
      required: true,
      configurable: false,
    },
    loggable_type: {
      type: 'string',
      required: true,
      configurable: false,
    },
    user: {
      type: 'relation',
      required: false,
      relation: 'oneToOne',
      target: 'plugin::users-permissions.user',
      configurable: false,
    },
    payload: {
      type: 'json',
      configurable: false,
    },
  }
}