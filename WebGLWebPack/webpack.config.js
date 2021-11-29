//SOURCE : 
// https://www.youtube.com/watch?v=rI37HS-Vj8A&list=PL4cUxeGkcC9hOkGbwzgYFmaxB0WiduYJC&index=3

const path = require('path');
// Webpack configurations;
module.exports = {
    devtool:"eval-source-map",
    entry:"./src/index.ts"  ,    // relative path
    mode:"development"       ,
    module : {
        rules:[ //we need rules to compile ts into js
            { 
                test: /\.ts$/, // look for .ts endFilename if they do, continue
                use : 'ts-loader',
                include : [path.resolve(__dirname,"src")] // where should we find the ts files
            }
        ]
    },
    resolve:{
        extensions:['.ts','.js']
    },
    output:{
        filename:"WebGL.js",
        path: path.resolve(__dirname,"public")  // not relative path, but abosulte
    }
}