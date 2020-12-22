import WebpackClientConfig from './client';
import WebpackServerConfig from './server';

export default nectary => ({
  client: (new WebpackClientConfig(nectary)).config(),
  server: (new WebpackServerConfig(nectary)).config()
})
