import { execSync } from 'child_process';
import { ipcMain } from 'electron';

// win
const WinRegBinPath =
  process.arch === 'ia32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')
    ? '%windir%\\sysnative\\cmd.exe /c %windir%\\System32'
    : '%windir%\\System32';
const WinParameter =
  `${WinRegBinPath}\\REG.exe ` +
  'QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography ' +
  '/v MachineGuid';
export function getMachineGuidWin() {
  try {
    return execSync(WinParameter)
      .toString()
      .split('REG_SZ')[1]
      .replace(/\r+|\n+|\s+/gi, '')
      .toLowerCase();
  } catch (error) {
    throw error;
  }
}

// linux
const LinuxParameter =
  '( cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || hostname ) | head -n 1 || :';
export function getMachineGuidLinux() {
  try {
    return execSync(LinuxParameter)
      .toString()
      .replace(/\r+|\n+|\s+/gi, '')
      .toLowerCase();
  } catch (error) {
    throw error;
  }
}

// darwin
const DarwinParameter = 'ioreg -rd1 -c IOPlatformExpertDevice';
export function getMachineGuidDarwin() {
  try {
    return execSync(DarwinParameter)
      .toString()
      .split('IOPlatformUUID')[1]
      .split('\n')[0]
      .replace(/\=|\s+|\"/gi, '')
      .toLowerCase();
  } catch (error) {
    throw error;
  }
}

export function getMachineGuid() {
  return process.platform === 'win32'
    ? getMachineGuidWin()
    : process.platform === 'linux'
    ? getMachineGuidLinux()
    : process.platform === 'darwin'
    ? getMachineGuidDarwin()
    : 'none';
}

/**
 * 监听
 */
export function machineOn() {
  ipcMain.handle('machineguid-get', async (event, args) => getMachineGuid());
}
