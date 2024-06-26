import type { CookiesGetFilter, CookiesSetDetails } from 'electron';
import { SessionChannel } from '../preload/channel';

/**
 * 设置http/https指定域名请求头
 */
export function sessionHeadersSet(
  type: 'all' | 'alone',
  url: string,
  value: { [key: string]: string }
) {
  window.electronic.send(SessionChannel.setHeaders, { type, url, value });
}

/**
 * 获取 cookies
 * @param args
 */
export function sessionCookiesGet(args: CookiesGetFilter) {
  return window.electronic.invoke(SessionChannel.getCookies, args);
}

/**
 * 设置 cookies
 * @param args
 */
export async function sessionCookiesSet(args: CookiesSetDetails) {
  return window.electronic.invoke(SessionChannel.setCookies, args);
}

/**
 * 移除 Cookies
 * @param url
 * @param name
 */
export async function sessionCookiesRemove(url: string, name: string) {
  return window.electronic.invoke(SessionChannel.unCookies, { url, name });
}
