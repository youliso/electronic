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

export enum ShortcutChannel {
  register = 'shortcut-register',
  unregister = 'shortcut-unregister',
  get = 'shortcut-get'
}

export enum WindowChannel {
  maxMinSize = 'window-max-min-size',
  func = 'window-func',
  status = 'window-status',
  load = 'window-load',
  reload = 'window-reload',
  setAlwaysTop = 'window-always-top-set',
  setIgnoreMouseEvents = 'window-ignore-mouse-events-set',
  setSize = 'window-size-set',
  setMinMaxSize = 'window-min-max-size-set',
  setBackgroundColor = 'window-bg-color-set',
  sendMessage = 'window-message-send',
  sendMessageContents = 'window-message-contents-send'
}
