const reqConfig = require('../reqConfig.json');
const token = require('../token/getToken')();
const { protocol, hostName, basePath, headers, v } = reqConfig;

const BASE_OPTIONS = {
    uri: `${protocol}://${hostName}/${basePath}`,
    qs: {
      access_token: token,
      v,
    },
    headers,
    json: true, // Automatically parses the JSON string in the response
};

module.exports = function getRequestOptions(apiMethod, reqParams) {
  const qs = Object.assign({}, BASE_OPTIONS.qs, reqParams);
  const uri = `${BASE_OPTIONS.uri}/${apiMethod}`;
  const options = Object.assign({}, BASE_OPTIONS, {
    qs,
    uri
  });

  return options;
};
