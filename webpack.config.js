const path = require('path')
const srcDir = path.resolve(__dirname, 'src')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    entry : `${srcDir}/index.js`,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.bundle.js'
    },
    node: {
        fs: 'empty',
    },
    module: {
      loaders: [
          {
              test: /\.js$/,
              loader: 'babel-loader',
              exclude: /node_modules/
          },
          {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader'],
                    publicPath: '/dist'
                })
            },
            {
                test: /\.(jpe?g|png|gif|svg|jpg)$/i,
                use: [
                    'file-loader?name=[hash:6].[ext]&outputPath=images/'                   
                ]
            }
      ]
    },
    plugins: [
         new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new ExtractTextPlugin({
            filename: 'main.css',
            disable: false,
            allChunks: true
        })
    ]
}