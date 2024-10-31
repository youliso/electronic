import { preload } from '../preload';
import { MachineChannel } from '../channel';

/**
 * 获取设备唯一吗
 */
export function getMachineGuid(): Promise<string> {
  return preload.invoke(MachineChannel.get);
}
