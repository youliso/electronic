import type { MakeDirectoryOptions } from 'fs';
import { FileChannel } from '../preload/channel';

/**
 * 读取目录下指定后缀文件
 * @param path
 * @param fileName
 */
export async function fileBySuffix(path: string, fileName: string) {
  return await window.electronic.invoke(FileChannel.suffix, { path, fileName });
}

/**
 * 创建目录和内部文件
 * */
export async function mkdir(path: string, options?: MakeDirectoryOptions) {
  return await window.electronic.invoke(FileChannel.mkdir, { path, options });
}

/**
 * 删除目录和内部文件
 * */
export async function delDir(path: string) {
  return await window.electronic.invoke(FileChannel.deldir, { path });
}

/**
 * 删除文件
 * */
export async function unlink(path: string) {
  return await window.electronic.invoke(FileChannel.unlink, { path });
}

/**
 * 检查文件是否存在于当前目录中、以及是否可写
 * @return 0 不存在 1 只可读 2 存在可读写
 */
export async function access(path: string) {
  return await window.electronic.invoke(FileChannel.access, { path });
}

/**
 * 文件重命名
 * @return 0 失败 1 成功
 */
export async function rename(path: string, newPath: string) {
  return await window.electronic.invoke(FileChannel.rename, { path, newPath });
}

/**
 * 读取整个文件
 * @param path 文件路径
 * @param options 选项
 */
export async function readFile(
  path: string,
  options?: { encoding?: BufferEncoding; flag?: string }
) {
  return await window.electronic.invoke(FileChannel.readFile, { path, options });
}

/**
 * 逐行读取
 * @param path
 * @param index
 */
export async function readLine(path: string, index?: number): Promise<string | any[]> {
  return await window.electronic.invoke(FileChannel.readLine, { path, index });
}

/**
 * 覆盖数据到文件
 * @return 0 失败 1 成功
 */
export async function writeFile(
  path: string,
  data: string | Buffer,
  options?: { encoding?: BufferEncoding; mode?: number | string; flag?: string }
) {
  return await window.electronic.invoke(FileChannel.writeFile, { path, data, options });
}

/**
 * 追加数据到文件
 * @return 0 失败 1 成功
 */
export async function appendFile(
  path: string,
  data: string | Uint8Array,
  options?: { encoding?: BufferEncoding; mode?: number | string; flag?: string }
) {
  return await window.electronic.invoke(FileChannel.appendFile, { path, data, options });
}
