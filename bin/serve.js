#!/usr/bin/env node

const { rspack } = require('@rspack/core');
const { RspackDevServer } = require('@rspack/dev-server');
const path = require('path');
const Router = require(path.resolve(__dirname, '../mid/mock'));


const htmlFile = path.resolve(__dirname, "../pub/index.html");
const entryFile = path.resolve(__dirname, "../pub/index.js");

const complier = rspack({
  entry: {
    main: entryFile,
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      title: 'MSA Config Checker',
      template: htmlFile,
    }),
    new rspack.IgnorePlugin({
      resourceRegExp: /\.d\.ts$/,
    }),
  ],
  
});

const devServer = new RspackDevServer({
  client: {
    overlay: false,
  },
  setupMiddlewares: (middlewares) => {
    middlewares.unshift(Router);
    return middlewares;
  },
}, complier);

devServer.start();
