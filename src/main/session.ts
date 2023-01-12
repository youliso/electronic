import type { CookiesGetFilter, CookiesSetDetails } from 'electron';
import { ipcMain, session } from 'electron';

/**
 * 监听
 */
export class Session {
  public AllHeaders: { [key: string]: { [key: string]: string } } = {};
  public Headers: { [key: number]: { [key: string]: { [key: string]: string } } } = {};

  constructor() {
  }

  /**
   * 拦截指定http/https请求并更换、增加headers
   */
  webRequest() {
    session.defaultSession.webRequest.onBeforeSendHeaders(
      {
        urls: ['http://*/*', 'https://*/*']
      },
      (details, callback) => {
        Object.keys(this.AllHeaders)
          .filter((key: string) => details.url.startsWith(key))
          .forEach((key) => {
            for (const v in this.AllHeaders[key]) {
              details.requestHeaders[v] = this.AllHeaders[key][v];
            }
          });
        const headers = this.Headers[details.webContentsId as number];
        if (headers) {
          Object.keys(headers)
            .filter((key: string) => details.url.startsWith(key))
            .forEach((key) => {
              for (const v in headers) {
                details.requestHeaders[v] = headers[key][v];
              }
            });
        }
        callback({ requestHeaders: details.requestHeaders });
      }
    );
  }

  /**
   * 设置setUserAgent/acceptLanguages
   * @param userAgent
   * @param acceptLanguages
   */
  setUserAgent(userAgent: string, acceptLanguages?: string) {
    session.defaultSession.setUserAgent(userAgent, acceptLanguages);
  }

  /**
   * 获取 Cookies
   * @param filter
   */
  getCookies(filter: CookiesGetFilter) {
    return session.defaultSession.cookies.get(filter);
  }

  /**
   * 设置 Cookies
   * 如果存在，则会覆盖原先 cookie.
   * @param details
   */
  async setCookies(details: CookiesSetDetails) {
    await session.defaultSession.cookies.set(details);
  }

  /**
   * 移除 Cookies
   * @param url
   * @param name
   */
  async removeCookies(url: string, name: string) {
    await session.defaultSession.cookies.remove(url, name);
  }

  /**
   * 获取缓存大小
   */
  async getCacheSize() {
    return await session.defaultSession.getCacheSize();
  }

  /**
   * 清除缓存
   */
  async clearCache() {
    await session.defaultSession.clearCache();
  }

  /**
   * 开启监听
   */
  on() {
    this.webRequest();
    //设置url请求头
    ipcMain.on('session-headers-set', async (event, args) => {
      switch (args.type) {
        case 'all':
          this.AllHeaders = Object.assign(this.AllHeaders, { [args.url]: args.value });
          break;
        case 'alone':
          this.Headers[event.sender.id] = Object.assign(this.Headers[event.sender.id], {
            [args.url]: args.value
          });
          break;
      }
    });
    //设置 Cookies
    ipcMain.handle('session-cookies-set', async (event, args) => this.setCookies(args));
    //获取 Cookies
    ipcMain.handle('session-cookies-get', async (event, args) => this.getCookies(args));
    //移除 Cookies
    ipcMain.handle('session-cookies-remove', async (event, args) =>
      this.removeCookies(args.url, args.name)
    );
  }
}
