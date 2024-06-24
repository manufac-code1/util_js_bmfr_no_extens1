const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',  // Updated entry point
  output: {
    filename: 'index.js',  // Updated output filename
    path: path.resolve(__dirname, '../build'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext][query]',
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),
    },
    compress: true,
    port: 8080,
    open: true,
    historyApiFallback: {
      index: 'index.html',  // Serve index.html by default
    },
    client: {
      logging: 'verbose',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',  // Updated template
      filename: 'index.html',  // Updated output filename
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/libs', to: 'libs' },
        { from: './src/data', to: 'data' },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'index.css',  // Updated output filename
    }),
  ],
};