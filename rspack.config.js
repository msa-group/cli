const rspack = require('@rspack/core');
const path = require('path');
// const watchFile = require('./scripts/ymlToStr');



const htmlFile = path.resolve(__dirname, "./src/pub/index.html");
const entryFile = path.resolve(__dirname, "./src/pub/index.tsx");

/**
 * @type {import('@rspack/core').Configuration}
 */
module.exports = {
  entry: {
    main: entryFile,
  },
  experiments: {
    css: true,
  },
  devServer: {
    setupMiddlewares: (middlewares) => {
      // watchFile();
      // middlewares.unshift(Router);
      return middlewares;
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.d.ts'],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      title: 'MSA Config Checker',
      template: htmlFile,
    }),
    // new rspack.IgnorePlugin({
    //   resourceRegExp: /\.d\.ts$/,
    // }),
  ],
  module: {
    rules: [
      {
        test: /\.less$/,
        type: 'css/auto', // 👈
        use: ['less-loader'],
      },
      {
        test: /\.js$|tsx?/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
        },
        type: 'javascript/auto',
      }
    ],
  },
};