import type { LoadURLOptions, LoadFileOptions } from "electron";
export interface Customize {
    id?: number;
    title?: string;
    headNative?: boolean;
    url?: string;
    route?: string;
    loadOptions?: LoadURLOptions | LoadFileOptions;
    parentId?: number;
    currentWidth?: number;
    currentHeight?: number;
    currentMaximized?: boolean;
    isOneWindow?: boolean;
    isMainWin?: boolean;
    isPackaged?: boolean;
    argv?: any;
    data?: any;
}
export interface Window {
    customize: Customize;
}
export interface AppInfo {
    name: string;
    version: string;
}
export declare type AppPathKey = "home" | "appData" | "userData" | "cache" | "temp" | "exe" | "module" | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | "recent" | "logs" | "crashDumps";
export declare type WindowAlwaysOnTopOpt = "normal" | "floating" | "torn-off-menu" | "modal-panel" | "main-menu" | "status" | "pop-up-menu" | "screen-saver";
export declare type WindowFuncOpt = "close" | "hide" | "show" | "minimize" | "maximize" | "restore" | "reload";
export declare type WindowStatusOpt = "isMaximized" | "isMinimized" | "isFullScreen" | "isAlwaysOnTop" | "isVisible" | "isFocused" | "isModal";
export interface UpdateMessage {
    code: number;
    msg: string;
    value?: any;
}
export declare type Accelerator = {
    name: string;
    key: string | string[];
    callback: () => void;
};
