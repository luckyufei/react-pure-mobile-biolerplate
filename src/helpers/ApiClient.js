import envConfig from '../config';
import 'isomorphic-fetch';
import LogicError from 'utils/logicError'

const methods = ['get', 'post', 'put', 'patch', 'del'];
const APP_JSON_CONTENT_TYPE = 'application/json;charset=utf-8';
const TAG = __SERVER__ ? require('chalk').cyan("Fetch:: ") : "Fetch::";

function formatUrl(path) {
  const adjustedPath = path[0] !== '/' ? '/' + path : path;
  if (__SERVER__) {
    // Prepend host and port of the API server to the path.
    return `http://${envConfig.host}:${envConfig.port}/api${adjustedPath}`;
  }
  // Prepend `/api` to relative URL, to proxy to API server.
  return `/api${adjustedPath}`;
}

function timeout(secs, promise) {
  return new Promise((resolve, reject) => {
    let timeout = setTimeout(() => reject(new Error("fetch timeout arrive!")), secs);
    promise.then(resolve, reject);
  });
}

/*
 * This silly underscore is here to avoid a mysterious "ReferenceError: ApiClient is not defined" error.
 * See Issue #14. https://github.com/erikras/react-redux-universal-hot-example/issues/14
 *
 * Remove it at your own risk.
 */
function _ApiClient(req){
   methods.forEach((method) =>
      this[method] = (path, { params, data } = {}) => new Promise((resolve, reject) => {

        const options = {
          method: method,
          credentials: 'include',
          timeout: 10000,
          headers: {
            'Content-Type': APP_JSON_CONTENT_TYPE,
            'Accept': APP_JSON_CONTENT_TYPE,
          }
        };

        if (!__SERVER__) {
          options.headers['x-client-fetch'] = '1';
        }

        if (__SERVER__ && req.get('cookie')) {
          options.headers.cookie = req.get('cookie');
        }
        if (data) {
          options.body = JSON.stringify(data, (key, value) => {
            if (value == null) {
              return undefined;
            } else {
              return value;
            }
          });
        }
        let url = formatUrl(path);
        if (params) {
          url += Object.keys(params).reduce((acc, key) => (acc += `${key}=${params[key]}&`), "?");
          url = url.slice(0, url.length - 1);
        }

        console.log(`${TAG} start => ${url}`);
        return timeout(10000, fetch(url, options))
          .then(response => {
            if (~[401, 403, 404].indexOf(response.status)) {
              console.error(`${TAG} ${response.url} status: ${response.status}, statusText:${response.statusText}`);
              return reject(new LogicError({
                status: response.status,
                message: `fetch ${url} fail, status=${response.status}, statusText=${response.statusText}`,
              }));
            } else if (response.status === 418) {
              if (!__SERVER__ && typeof window !== 'undefined' && window.location) {
                window.location.reload();
              } else {
                console.error('Unexpected http status 418 when fetching via server side!');
              }
            } else {
              return response.json().then(json => ({ json, response }));
            }
          })
          .then(({ json, response }) => {
            if (!response.ok || response.status !== 200) {
              console.error(`${TAG}  ${response.url} status: ${response.status}, response: `, response.json());
              reject(new LogicError({
                status: response.status,
                errorCode: json.errorCode,
                message: json.message,
              }));
            } else {
              console.log(`${TAG} ${response.url} status: ${response.status}, statusText:${response.statusText}`);
              resolve(json);
            }
          });
      }));
}
 

const ApiClient = _ApiClient;

export default ApiClient;
