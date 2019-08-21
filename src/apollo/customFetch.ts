import lodash from 'lodash';
import { authenticationActionCreators } from '../redux/authentication/reducer';
import { refreshToken as refreshCredentials } from '../api/apiClient';
import { store } from '../redux/store';

interface Options {
  body?: BodyInit_;
  credentials?: RequestCredentials_;
  headers?: { [key: string]: string };
  integrity?: string;
  keepalive?: boolean;
  method?: string;
  mode?: RequestMode_;
  referrer?: string;
}

export const customFetch = async (uri: string, options: Options): Promise<Response> => {
  const state = store.getState();

  const response = await fetch(uri, options);
  const initialResponse = lodash.cloneDeep(response);
  const json = await response.json();

  if (json && json.errors && json.errors[0] && json.errors[0].message === 'GqlAuthGuard') {
    const refreshToken = state.authentication.refreshToken;
    const email = state.authentication.email;
    try {
      const refreshResponse = await refreshCredentials(email, refreshToken);
      store.dispatch(authenticationActionCreators.refreshTokens(refreshResponse.data));
      const refreshedOptions = { ...options };
      if (!refreshedOptions.headers) {
        refreshedOptions.headers = {};
      }
      refreshedOptions.headers.authorization = `Bearer ${refreshResponse.data.accessToken}`;
      return fetch(uri, refreshedOptions);
    } catch (error) {
      store.dispatch(authenticationActionCreators.logout());
    }
  }

  return new Promise(resolve => {
    resolve(initialResponse);
  });
};