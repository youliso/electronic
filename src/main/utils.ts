import { existsSync, readdirSync, rmdirSync, statSync, unlinkSync } from 'fs';

/**
 * 深拷贝
 * @param obj
 */
export function deepCopy<T>(obj: any): T {
  const isArray = Array.isArray(obj);
  let result: any = {};
  if (isArray) result = [];
  let temp = null;
  let key = null;
  let keys = Object.keys(obj);
  keys.map((item, index) => {
    key = item;
    temp = obj[key];
    if (temp && typeof temp === 'object') {
      if (isArray) result.push(deepCopy(temp));
      else result[key] = deepCopy(temp);
    } else {
      if (isArray) result.push(temp);
      else result[key] = temp;
    }
  });
  return result;
}

/**
 * 删除目录和内部文件
 * */
export function delDir(path: string): void {
  let files = [];
  if (existsSync(path)) {
    files = readdirSync(path);
    files.forEach((file) => {
      let curPath = path + '/' + file;
      if (statSync(curPath).isDirectory()) {
        delDir(curPath); //递归删除文件夹
      } else {
        unlinkSync(curPath); //删除文件
      }
    });
    rmdirSync(path);
  }
}
