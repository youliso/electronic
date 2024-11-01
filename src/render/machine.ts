import { preload } from '../preload/render';
import { MachineChannel } from '../channel';

/**
 * 获取设备唯一吗
 */
export function getMachineGuid(): Promise<string> {
  return preload.invoke(MachineChannel.get);
}
