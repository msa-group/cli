#!/usr/bin/env node


const { rspack } = require('@rspack/core');
const { RspackDevServer } = require('@rspack/dev-server');
const path = require('path');
const Router = require(path.resolve(__dirname, '../mid/mock'));

const root = path.resolve(__dirname, '../../');

const htmlFile = path.resolve(__dirname, "../pub/index.html");
const entryFile = path.resolve(__dirname, "../pub/index.tsx");

const complier = rspack({
  entry: {
    main: entryFile,
  },
  experiments: {
    css: true,
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
  resolveLoader: {
    alias: {
      "less-loader": path.resolve(root, 'node_modules/less-loader/dist/cjs.js'),
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.d.ts'],
  },
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
});

const devServer = new RspackDevServer({
  client: {
    overlay: false,
  },
  allowedHosts: [
    "my.console.aliyun.com",
  ],
  setupMiddlewares: (middlewares) => {
    middlewares.unshift(Router);
    return middlewares;
  },
}, complier);

devServer.start();
