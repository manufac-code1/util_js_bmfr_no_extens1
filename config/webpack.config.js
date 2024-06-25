const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      minify: false,
    }),
    new MiniCssExtractPlugin({
      filename: 'index.css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/libs', to: 'libs' },
        { from: './src/data', to: 'data' },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, '../build'),
    },
    compress: true,
    port: 9000,
  },
  optimization: {
    minimize: false,
  },
};