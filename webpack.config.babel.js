import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const dir = (...args) => path.resolve(__dirname, ...args);
const codedir = (...args) => dir('app', ...args);
const outdir = (...args) => dir('dist', ...args);

export default {
  devtool: 'source-map',
  entry: codedir('index.jsx'),
  output: {
    filename: 'bundle.js',
    path: outdir(),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: ['babel-loader', 'eslint-loader'],
      },

      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
      },

      { test: /\.css$/, loader: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: codedir('index.html.ejs') })],
  resolve: { extensions: ['.js', '.jsx'] },
  devServer: {
    proxy: {
      '/socket.io/**': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
};
