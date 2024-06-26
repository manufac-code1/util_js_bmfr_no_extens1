// Import necessary Node.js modules for path resolution
const path = require('path');
// Import plugins for enhancing webpack functionality
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Simplifies creation of HTML files to serve webpack bundles
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // Extracts CSS into separate files
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Copies individual files or entire directories to the build directory

// Webpack configuration object
module.exports = {
  entry: './src/index.js', // Entry point for the application
  output: {
    path: path.resolve(__dirname, '../build'), // Output directory for the build
    filename: 'index.js', // Name of the output bundle
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Matches JavaScript files
        exclude: /node_modules/, // Excludes the node_modules directory
        use: {
          loader: 'babel-loader', // Uses babel-loader to transpile JavaScript files
        },
      },
      {
        test: /\.css$/, // Matches CSS files
        use: [MiniCssExtractPlugin.loader, 'css-loader'], // Uses MiniCssExtractPlugin and css-loader to process CSS files
      },
      {
        test: /\.(png|jpg|gif|svg)$/, // Matches image files
        type: 'asset/resource', // Serves these files as assets/resources
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Template file for the HTML webpack plugin
      filename: 'index.html', // Output filename for the HTML file
      minify: false, // Disables minification for the output HTML
    }),
    new MiniCssExtractPlugin({
      filename: 'index.css', // Output filename for the CSS bundle
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/libs', to: 'libs' }, // Copies libraries from src/libs to build/libs
        { from: './src/data', to: 'data' }, // Copies data from src/data to build/data
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, '../build'), // Directory to serve static files from
    },
    compress: true, // Enables gzip compression
    port: 9000, // Port number for the webpack dev server
  },
  optimization: {
    minimize: false, // Disables code minimization
  },
};