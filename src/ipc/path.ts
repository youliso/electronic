import { PathChannel } from '../preload/channel';

export async function sep(): Promise<string> {
  return await window.ipc.invoke(PathChannel.sep);
}

export async function isAbsolute(path: string): Promise<string> {
  return await window.ipc.invoke(PathChannel.isAbsolute, path);
}

export async function dirname(path: string): Promise<string> {
  return await window.ipc.invoke(PathChannel.dirname, path);
}

export async function normalize(path: string): Promise<string> {
  return await window.ipc.invoke(PathChannel.normalize, path);
}

export async function basename(path: string): Promise<string> {
  return await window.ipc.invoke(PathChannel.basename, path);
}
