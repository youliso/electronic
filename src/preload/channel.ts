export enum AppChannel {
  getInfo = 'app-info-get',
  getPath = 'app-path-get',
  openUrl = 'app-open-url',
  quit = 'app-quit',
  relaunch = 'app-relaunch'
}

export enum StoreChannel {
  set = 'store-set',
  get = 'store-get'
}

export enum MachineChannel {
  get = 'machineguid-get'
}

export enum SessionChannel {
  setHeaders = 'session-headers-set',
  setCookies = 'session-cookies-set',
  getCookies = 'session-cookies-get',
  unCookies = 'session-cookies-remove'
}

export enum ShortcutChannel {
  register = 'shortcut-register',
  unregister = 'shortcut-unregister',
  get = 'shortcut-get'
}

export enum UpdateChannel {
  check = 'update-check',
  download = 'update-download',
  install = 'update-install'
}

export enum WindowChannel {
  update = 'window-update',
  maxMinSize = 'window-max-min-size',
  func = 'window-func',
  status = 'window-status',
  new = 'window-new',
  setAlwaysTop = 'window-always-top-set',
  setSize = 'window-size-set',
  setMinMaxSize = 'window-min-max-size-set',
  setBackgroundColor = 'window-bg-color-set',
  sendMessage = 'window-message-send',
  sendMessageContents = 'window-message-contents-send',
  getWinId = 'window-id-get'
}

const getChannels = () => {
  let channels = {
    AppChannel,
    StoreChannel,
    MachineChannel,
    SessionChannel,
    ShortcutChannel,
    UpdateChannel,
    WindowChannel
  };
  let channelValue: string[] = [];
  for (let channel in channels) {
    // @ts-ignore
    const keys = channels[channel];
    for (let key in keys) {
      // @ts-ignore
      isNaN(key) && channelValue.push(keys[key]);
    }
  }
  return channelValue;
};

export const channels = getChannels();
