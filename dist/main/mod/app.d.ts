import type { Customize } from '../types';
declare class App {
    private static instance;
    isDisableHardwareAcceleration: boolean;
    isSecondInstanceWin: boolean;
    windowDefaultCustomize: Customize;
    windowDefaultOpt: Electron.BrowserWindowConstructorOptions;
    modular: {
        [key: string]: any;
    };
    static getInstance(): App;
    constructor();
    private uring;
    usee(): void;
    /**
     * 挂载模块
     * @param mod
     */
    use(mod: any | any[] | Promise<any>[]): Promise<void>;
    /**
     * 启动主进程
     */
    start(): Promise<void>;
    /**
     * 监听
     */
    beforeOn(): void;
    /**
     * 监听
     */
    afterOn(): void;
}
export declare const appInstance: App;
export {};
