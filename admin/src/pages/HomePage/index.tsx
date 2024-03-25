/*
 *
 * HomePage
 *
 */

import { Layout, Main, HeaderLayout } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import pluginId from '../../pluginId';

const HomePage = () => {
  const { formatMessage } = useIntl();

  return (
    <Layout>
      <Main>
        <HeaderLayout
          title={formatMessage({
            id: `${pluginId}.plugin.pages.App.title`,
            defaultMessage: 'ComfyUI',
          })}
          subtitle={formatMessage({
            id: `${pluginId}.plugin.pages.HomePage.subTitle`,
            defaultMessage: 'Manage ComfyUI configuration and settings.',
          })}
        />
      </Main>
    </Layout>
  );
};

export default HomePage;
