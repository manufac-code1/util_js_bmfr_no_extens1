const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',  // Explicitly set mode to development
  entry: './src/index.js',
  output: {
    filename: 'index.js',  // Changed from 'main.js' to 'index.js'
    path: path.resolve(__dirname, '../build'),
    publicPath: '/',  // Set to root directory
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
  devServer: {
    static: {
      directory: path.join(__dirname, '../build'),  // Correct path to serve from
    },
    compress: true,
    port: 8080,
    open: true,
    client: {
      logging: 'verbose',  // Keep verbose logging for now
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',  // Changed from 'main.html' to 'index.html'
      filename: 'index.html',  // Changed from 'main.html' to 'index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/libs', to: 'libs' },
        { from: './src/data', to: 'data' },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'index.css',  // Changed from 'main.css' to 'index.css'
    }),
  ],
};