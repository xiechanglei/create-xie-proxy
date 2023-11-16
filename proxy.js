
//端口转发服务
const localPort = 8080;
const remotePort = 8080;
const remoteHost = "192.168.16.153"
const proxyServer = http.createServer();
const proxy = httpProxy.createProxyServer();

proxyServer.on('request', (req, res) => {
    console.log("proxy", req.method, req.url);
    proxy.web(req, res, { target: `http://${remoteHost}:${remotePort}` });
});

if(useProxy){
    proxyServer.listen(localPort, () => console.log('proxy server is running at port 8080'));
}
