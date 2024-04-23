#!/usr/bin/env node

import http from "http";
import fs from "fs";
import path from "path";
import {info, success, error} from "./log.js"
import {getContentType} from "./content-type.js";
import minimist from "minimist"
import os from "os"

const server = http.createServer()

const args = minimist(process.argv.slice(2));
const port = args.port === undefined || args.port === true ? 8080 : args.port
const cross = args.cross !== undefined && args.cross === true

// 处理请求
server.on('request', (req, res) => {
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
            if (cross) {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "*");
                res.setHeader("Access-Control-Max-Age", "3600");
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Headers", "*");
                res.setHeader("Content-Type", getContentType(path.extname(filePath).slice(1)));
                fs.createReadStream(filePath).pipe(res);
            }
        }
        const message = `GET ${res.statusCode} ${uri}`
        const log = res.statusCode === 200 ? success : error
        log(message)
    })
})

const getIpv4Address = () => {
    const ips = []
    let interfaces = os.networkInterfaces();
    for (let iface in interfaces) {
        for (let alias of interfaces[iface]) {
            if (alias.address && alias.address.indexOf(":") === -1) {
                ips.push(alias.address)
            }
        }

    }
    return ips;
}

//错误处理
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        error(`server start failed: port ${port} is in used`);
    } else {
        error(err);
    }

});
//监听端口
server.listen(port, () => {
    info(`server is running at port ${port}`)
    const ips = getIpv4Address();
    for (let ip of ips) {
        info(`\thttp://${ip}:${port}/`);
    }
    info("waiting for request ...");
});

