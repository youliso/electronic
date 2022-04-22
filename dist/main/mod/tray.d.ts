import { Tray } from 'electron';
export declare class Trays {
    main: Tray | undefined;
    constructor();
    /**
     * 创建托盘
     * */
    create(trayImgPath: string): void;
    /**
     * 监听
     */
    on(): void;
}
