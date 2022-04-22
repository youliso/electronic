import type { CookiesGetFilter, CookiesSetDetails } from 'electron';
/**
 * 监听
 */
export declare class Session {
    /**
     * 头部 headers
     * 键值对 => 域名: Headers
     */
    urlHeaders: {
        [key: string]: {
            [key: string]: string;
        };
    };
    constructor();
    /**
     * 拦截指定http/https请求并更换、增加headers
     */
    webRequest(): void;
    /**
     * 设置setUserAgent/acceptLanguages
     * @param userAgent
     * @param acceptLanguages
     */
    setUserAgent(userAgent: string, acceptLanguages?: string): void;
    /**
     * 获取 Cookies
     * @param filter
     */
    getCookies(filter: CookiesGetFilter): Promise<Electron.Cookie[]>;
    /**
     * 设置 Cookies
     * 如果存在，则会覆盖原先 cookie.
     * @param details
     */
    setCookies(details: CookiesSetDetails): Promise<void>;
    /**
     * 移除 Cookies
     * @param url
     * @param name
     */
    removeCookies(url: string, name: string): Promise<void>;
    /**
     * 获取缓存大小
     * @returns treatedBytes {bytes, unit}
     */
    getCacheSize(): Promise<import("../utils").treatedBytes>;
    /**
     * 清除缓存
     */
    clearCache(): Promise<void>;
    /**
     * 开启监听
     */
    on(): void;
}
