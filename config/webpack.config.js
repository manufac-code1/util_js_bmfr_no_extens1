const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',  // Explicitly set mode to development
  entry: './src/main.js',
  output: {
    filename: 'main.js',
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
  devServer: {
    static: {
      directory: path.join(__dirname, '../build'),
    },
    compress: true,
    port: 8080,
    open: true,
    historyApiFallback: {
      index: '/main.html',  // Ensure main.html is served as the default file
    },
    client: {
      logging: 'verbose',  // Keep verbose logging for now
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/main.html',
      filename: 'main.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/libs', to: 'libs' },
        { from: './src/data', to: 'data' },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'main.css',
    }),
  ],
};