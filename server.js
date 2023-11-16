#!/usr/bin/env node

import chalk from "chalk";
import http from "http";
import fs from "fs";
import path from "path";
import {getContentType} from "./content-type.js";

const defaultPort = 9123
const [, , listenPort = defaultPort] = process.argv;

const info = msg => console.log(chalk.blue(msg))
const error = msg => console.log(chalk.red(msg))
const success = msg => console.log(chalk.green(msg))


const server = http.createServer()
// 处理请求
server.on('request', (req, res) => {
    // 截断请求参数
    let uri = req.url.split("?")[0];
    uri = uri.replace(/\/$/, "/index.html");
    // 映射到目录下
    let filePath = path.join("./", uri);
    // 如果是目录，则默认访问index.html
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.statusCode = 404;
            res.end(filePath + " not found");
        } else {
            // 设置跨域
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Content-Type", getContentType(path.extname(filePath).slice(1)));
            fs.createReadStream(filePath).pipe(res);
        }
        const message = `GET ${res.statusCode} ${uri}`
        const log = res.statusCode === 200 ? success : error
        log(message)
    })
})

//错误处理
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        error(`server start failed: port ${listenPort} is in used`);
    } else {
        error(err);
    }

});


console.log("")
//监听端口
server.listen(listenPort, () => info(`server is running at port ${listenPort}，waiting for request ...`));

