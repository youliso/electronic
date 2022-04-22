/// <reference types="node" />
import { MakeDirectoryOptions } from 'fs';
/**
 * 读取目录下指定后缀文件
 * @param path
 * @param suffix
 */
export declare function fileBySuffix(path: string, suffix: string): string[] | null;
/**
 * 删除目录和内部文件
 * */
export declare function delDir(path: string): void;
/**
 * 删除文件
 * @param path
 */
export declare function unlink(path: string): Promise<unknown>;
/**
 * 检查文件是否存在于当前目录中、以及是否可写
 * @return 0 不存在 1 只可读 2 存在可读写
 */
export declare function access(path: string): Promise<unknown>;
/**
 * 文件重命名
 * @return 0 失败 1 成功
 */
export declare function rename(path: string, newPath: string): Promise<unknown>;
/**
 * 读取整个文件
 * @param path 文件路径
 * @param options 选项
 */
export declare function readFile(path: string, options?: {
    encoding?: BufferEncoding;
    flag?: string;
}): Promise<unknown>;
/**
 * 逐行读取
 * @param path
 * @param index
 */
export declare function readLine(path: string, index?: number): Promise<string | any[]> | null;
/**
 * 创建目录
 * @param path
 * @param options
 * @returns 0 失败 1成功
 */
export declare function mkdir(path: string, options: MakeDirectoryOptions): Promise<unknown>;
/**
 * 创建文件
 * @return 0 失败 1 成功
 */
export declare function writeFile(path: string, data: string | Buffer, options?: {
    encoding?: BufferEncoding;
    mode?: number | string;
    flag?: string;
}): Promise<unknown>;
/**
 * 追加数据到文件
 * @return 0 失败 1 成功
 */
export declare function appendFile(path: string, data: string | Uint8Array, options?: {
    encoding?: BufferEncoding;
    mode?: number | string;
    flag?: string;
}): Promise<unknown>;
/**
 * 监听
 */
export declare function fileOn(): void;
