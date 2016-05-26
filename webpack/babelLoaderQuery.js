var packageJson = require('../package.json');
var babelrcObject = packageJson.babel;

var babelrcObjectDevelopment = babelrcObject.env && babelrcObject.env.development || {};

// merge global and dev-only plugins
var combinedPlugins = babelrcObject.plugins || [];
combinedPlugins = combinedPlugins.concat(babelrcObjectDevelopment.plugins);
console.log("NODE_ENV: ", process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
  delete babelrcObject.env;
  console.log("babelLoaderQuery: ", JSON.stringify(babelrcObject));
  module.exports = JSON.stringify(babelrcObject);
} else {
  var babelLoaderQuery = Object.assign({}, babelrcObjectDevelopment, babelrcObject, { plugins: combinedPlugins });
  delete babelLoaderQuery.env;
  // Since we use .babelrc for client and server, and we don't want HMR enabled on the server, we have to add
  // the babel plugin react-transform-hmr manually here.

  // make sure react-transform is enabled
  babelLoaderQuery.plugins = babelLoaderQuery.plugins || [];
  var reactTransform = null;
  for (var i = 0; i < babelLoaderQuery.plugins.length; ++i) {
    var plugin = babelLoaderQuery.plugins[i];
    if (Array.isArray(plugin) && plugin[0] === 'react-transform') {
      reactTransform = plugin;
    }
  }

  if (!reactTransform) {
    reactTransform = ['react-transform', { transforms: [] }];
    babelLoaderQuery.plugins.push(reactTransform);
  }

  if (!reactTransform[1] || !reactTransform[1].transforms) {
    reactTransform[1] = Object.assign({}, reactTransform[1], { transforms: [] });
  }

  // make sure react-transform-hmr is enabled
  reactTransform[1].transforms.push({
    transform: 'react-transform-hmr',
    imports: ['react'],
    locals: ['module']
  });

  console.log("babelLoaderQuery: ", JSON.stringify(babelLoaderQuery));
  module.exports = JSON.stringify(babelLoaderQuery);
}


