import { PathChannel } from '../preload/channel';

export async function sep(): Promise<string> {
  return await window.electronic.invoke(PathChannel.sep);
}

export async function isAbsolute(path: string): Promise<string> {
  return await window.electronic.invoke(PathChannel.isAbsolute, path);
}

export async function dirname(path: string): Promise<string> {
  return await window.electronic.invoke(PathChannel.dirname, path);
}

export async function normalize(path: string): Promise<string> {
  return await window.electronic.invoke(PathChannel.normalize, path);
}

export async function basename(path: string): Promise<string> {
  return await window.electronic.invoke(PathChannel.basename, path);
}
