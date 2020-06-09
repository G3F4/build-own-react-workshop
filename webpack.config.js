/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'lib/OwnReact.ts'),
      'react-dom': path.resolve(__dirname, 'lib/OwnReact.ts'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: 'public/index.html',
    }),
  ],
};
