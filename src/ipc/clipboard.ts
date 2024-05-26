import { ClipboardChannel } from '../preload/channel';

/**
 * 返回 string - 剪贴板中的内容为纯文本。
 * @param type
 */
export async function clipboardReadText(type?: 'selection' | 'clipboard'): Promise<string> {
  return await window.electronic.invoke(ClipboardChannel.readText, { type });
}

/**
 * 将 text 作为纯文本写入剪贴板。
 * @param text
 */
export async function clipboardWriteText(text: string): Promise<void> {
  return await window.electronic.invoke(ClipboardChannel.writeText, { text });
}
