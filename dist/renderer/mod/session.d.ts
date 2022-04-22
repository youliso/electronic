import type { CookiesGetFilter, CookiesSetDetails } from 'electron';
/**
 * 设置http/https指定域名请求头
 * 键值对 => 域名: Headers
 */
export declare function sessionHeadersSet(args: {
    [key: string]: {
        [key: string]: string;
    };
}): void;
/**
 * 获取 cookies
 * @param args
 */
export declare function sessionCookiesGet(args: CookiesGetFilter): Promise<any>;
/**
 * 设置 cookies
 * @param args
 */
export declare function sessionCookiesSet(args: CookiesSetDetails): Promise<any>;
/**
 * 移除 Cookies
 * @param url
 * @param name
 */
export declare function sessionCookiesRemove(url: string, name: string): Promise<any>;
