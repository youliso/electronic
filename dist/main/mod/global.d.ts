/// <reference types="node" />
interface Config {
    path: string;
    seat: string;
    parse: boolean;
    opt?: {
        encoding?: BufferEncoding;
        flag?: string;
    };
}
/**
 * Global
 */
declare class Global {
    private static instance;
    sharedObject: {
        [key: string]: any;
    };
    static getInstance(): Global;
    constructor();
    /**
     * 挂载配置
     * @param path 配置文件路径
     * @param seat 存放位置
     * @param parse 是否parse
     * @param opt
     */
    use(conf: Config | Config[]): Promise<void>;
    /**
     * 开启监听
     */
    on(): void;
    getGlobal<Value>(key: string): Value | undefined;
    sendGlobal<Value>(key: string, value: Value, exists?: boolean): void;
    /**
     * 获取资源文件路径
     * 不传path返回此根目录
     * 断言通过返回绝对路径 (inside 存在虚拟路径不做断言)
     * */
    getResourcesPath(type: 'platform' | 'inside' | 'extern' | 'root', path?: string): string;
}
export declare const globalInstance: Global;
export {};
