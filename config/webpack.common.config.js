"use strict";

let path = require("path");

module.exports = (env, argv) => {
  return {
    entry: "./src/browser/index.ts",

    output: {
      library: '',
      libraryTarget: 'commonjs',
      filename: `./common/xylo.common${argv.mode === 'development' ? '' : '.min'}.js`,
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
        }
      ]
    },

    resolve: {
      extensions: [".ts", ".js"]
    },

    optimization: {
      minimize: argv.mode !== 'development',
    },

    externals: {
      'plotly.js-dist': 'plotly.js-dist',
    },
  };
};
