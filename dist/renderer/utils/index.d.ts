/**
 * 判空
 * */
export declare function isNull(o: unknown): boolean;
/**
 * 随机整数
 * 例如 6-10 （m-n）
 * */
export declare function ranDom(m: number, n: number): number;
/**
 * 数组元素互换
 * @param arr
 * @param index1 需要更换位置的元素初始下标
 * @param index2 更改后的下标
 */
export declare function swapArr<T>(arr: T[], index1: number, index2: number): void;
/**
 * 对象转参数
 * @param data
 */
export declare function queryParams(data: any): string;
/**
 * 参数转对象
 * @param str
 */
export declare function toParams(str: string): any;
/**
 * 深拷贝
 * @param obj
 */
export declare function deepCopy<T>(obj: any): T;
/**
 * 防抖
 */
export declare function debounce(func: Function, wait: number): any;
/**
 * 节流
 */
export declare function throttle(func: Function, delay: number): any;
/**
 * 指定范围内的随机整数
 * @param start
 * @param end
 */
export declare function random(start?: number, end?: number): number;
export declare function assetsUrl(url: string): string;
declare const units: readonly ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "BB", "NB", "DB"];
declare type unit = typeof units[number];
export declare type treatedBytes = {
    bytes: number;
    unit: unit;
};
export declare function bytesToSize(bytes: number): treatedBytes;
export {};
