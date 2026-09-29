
const path = require('path');

module.exports = {
  mode: 'production',

  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },

  resolve: {
    extensions: ['.js'],
  },

  optimization: {
    minimize: true,
  },

  performance: {
    hints: false,
  },

  devtool: 'source-map',
};

