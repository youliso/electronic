export enum AppChannel {
  InfoGet = 'app-info-get',
  PathGet = 'app-path-get',
  OpenUrl = 'app-open-url',
  Quit = 'quit',
  Relaunch = 'app-relaunch'
}

export enum ClipboardChannel {
  readText = 'app-clipboard-read-text',
  writeText = 'app-clipboard-write-text'
}

export enum FileChannel {
  suffix = 'file-filebysuffix',
  mkdir = 'file-mkdir',
  deldir = 'file-deldir',
  unlink = 'file-unlink',
  access = 'file-access',
  rename = 'file-rename',
  readfile = 'file-readfile',
  readline = 'file-readline',
  writefile = 'file-writefile',
  appendfile = 'file-appendfile'
}

export enum StoreChannel {
  set = 'store-sharedObject-set',
  get = 'store-sharedObject-get'
}

export enum LogChannel {
  info = 'log-info',
  error = 'log-error'
}

export enum MachineChannel {
  get = 'machineguid-get'
}

export enum PathChannel {
  sep = 'path-sep',
  isAbsolute = 'path-isAbsolute',
  dirname = 'path-dirname',
  normalize = 'path-normalize',
  basename = 'path-basename'
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

export enum ViewChannel {
  new = 'view-new',
  exist = 'view-exist',
  alone = 'view-alone',
  hide = 'view-hide',
  hideAll = 'view-hide-all',
  remove = 'view-remove',
  removeAll = 'view-remove-all',
  show = 'view-show',
  stop = 'view-stop',
  reload = 'view-reload',
  setBounds = 'view-set-bounds',
  openDevTools = 'view-open-dev-tools',
  canGoBack = 'view-can-go-back',
  goBack = 'view-go-back',
  canGoForward = 'view-can-go-forward',
  goForward = 'view-go-forward'
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

export default {
  ...AppChannel,
  ...ClipboardChannel,
  ...FileChannel,
  ...StoreChannel,
  ...LogChannel,
  ...MachineChannel,
  ...PathChannel,
  ...SessionChannel,
  ...ShortcutChannel,
  ...UpdateChannel,
  ...ViewChannel,
  ...WindowChannel
};
