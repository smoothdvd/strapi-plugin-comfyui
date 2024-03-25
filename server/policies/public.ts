import { Strapi } from '@strapi/strapi';

export default (ctx: any, config: any, { strapi }: { strapi: Strapi }) => {
  if (ctx.state.user && ctx.state.user.isActive) {
    return true;
  }

  return false;
};