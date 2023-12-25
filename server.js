#!/usr/bin/env node

import http from "http";
import fs from "fs";
import path from "path";
import {info, success, error} from "./log.js"
import {getContentType} from "./content-type.js";
import {getConfig} from "./config.js";

const config = await getConfig();
const server = http.createServer()
console.log("")

const errorFilePath = path.join(process.cwd(), "xie.proxy.404.log");

// 处理请求
server.on('request', (req, res) => {
    if (config.proxy) {
        for (let prefix in config.proxy) {
            if (req.url.startsWith(prefix)) {
                const target = config.proxy[prefix];
                req.headers["Host"] = `${target.hostname}:${target.port}`
                const options = {
                    hostname: target.hostname,
                    port: target.port,
                    path: req.url.replace(prefix, target.pathname),
                    method: req.method,
                    headers: req.headers
                };
                const proxyReq = http.request(options, (proxyRes) => {
                    //设置跨域
                    for (let headerName in proxyRes.headers) {
                        res.setHeader(headerName, proxyRes.headers[headerName]);
                    }
                    res.statusCode = proxyRes.statusCode;
                    res.setHeader("Access-Control-Allow-Origin", "*");
                    proxyRes.pipe(res);
                });
                req.pipe(proxyReq);
                return
            }
        }
    }
    //本地处理
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
            fs.appendFile(errorFilePath, `${req.socket.encrypted ? "https" : "http"}://${req.headers.host}${req.url}\n`, (err) => {
                if (err) {
                    error(err);
                }
            });
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

//处理websocket
server.on('upgrade', (req, socket, head) => {
    if (config.proxy) {
        for (let prefix in config.proxy) {
            if (req.url.startsWith(prefix)) {
                //转发到目标服务器
                const target = config.proxy[prefix];
                const newUrl = req.url.replace(prefix, target.pathname);
            }
        }
    }
})

//错误处理
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        error(`server start failed: port ${config.port} is in used`);
    } else {
        error(err);
    }

});
//监听端口
server.listen(config.port, () => info(`server is running at port ${config.port}，waiting for request ...`));

