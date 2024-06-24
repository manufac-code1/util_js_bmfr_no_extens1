const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../build'),
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
      directory: path.join(__dirname, '../build'),
    },
    compress: true,
    port: 8080,
    open: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/main.html',
      filename: 'main.html',  // Ensure this generates main.html
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/libs', to: 'libs' },  // Copy libs directory
        { from: './src/data', to: 'data' },  // Copy data directory
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'main.css',  // Ensure CSS outputs to main.css
    }),
  ],
};