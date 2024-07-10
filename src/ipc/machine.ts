import { MachineChannel } from "../preload/channel";

/**
 * 获取设备唯一吗
 */
export function getMachineGuid(): Promise<string> {
  return window.electronic.invoke(MachineChannel.get);
}
