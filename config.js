import path from "path";
import fs from "fs";

const defaultPort = 9123
const configFileName = 'xie.proxy.config.json'
export const getConfig = async () => {
    const config = {};
    const [, , listenPort = defaultPort] = process.argv;
    config.port = listenPort;
    //判断当钱路径下的是否存在配置文件
    const configPath = path.join(process.cwd(), configFileName);
    if (fs.existsSync(configPath)) {
        const content = await fs.promises.readFile(configPath, "utf-8");
        const configJson = JSON.parse(content);
        if (configJson.proxy !== undefined) {
            for (let prefix in configJson.proxy) {
                configJson.proxy[prefix] = new URL(configJson.proxy[prefix]);
            }
        }
        Object.assign(config, configJson);
    }
    return config;
}