"use strict";

let path = require("path");

module.exports = (env, argv) => {
  return {
    entry: {
      transform: "./src/workers/transform.worker.ts",
      // Add other web workers here!
      // ex.
      // test: "./src/workers/test.worker.ts",
    },

    output: {
      filename: `./umd/[name].worker${argv.mode === 'development' ? '' : '.min'}.js`,
      path: path.resolve(__dirname, "../dist")
    },

    devtool: argv.mode === 'development' ?  "inline-source-map" : false,

    module: {
      rules: [
        {
          test: /\.js$/,
          use: "source-map-loader",
          enforce: "pre"
        },
        {
          test: /\.ts$/,
          loader: "ts-loader",
        },
      ]
    },

    resolve: {
      extensions: [".ts", ".js"]
    },

    optimization: {
      minimize: argv.mode !== 'development',
    },
  };
};
