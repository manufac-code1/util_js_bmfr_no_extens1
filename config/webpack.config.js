const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js',
    createAODM: './src/createAODM.js',
  },
  output: {
    filename: '[name].bundle.js',
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
        test: /\.less$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
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
  resolve: {
    alias: {
      jstree$: path.resolve(__dirname, '../src/libs/jstree.min.js'),
      jquery$: path.resolve(__dirname, '../src/libs/jQuery.min.js'),
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '../build'),
      serveIndex: true, // Enable directory listing
      watch: true, // Enable watching of files for changes
    },
    compress: true,
    port: 8080,
    open: true,
    client: {
      logging: 'verbose',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/libs', to: 'libs' },
        { from: './src/data', to: 'data' },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'index.css',
    }),
  ],
};