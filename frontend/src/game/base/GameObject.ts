import type { Inputhandler } from "./Game";

export interface GameObject {

    imagem: any;
    x: number;
    y: number;
    w: number;
    h: number;

    draw(contex: CanvasRenderingContext2D): void;
    update(deltaTime: number): void;
    keyDown?(key: string[]): void;
    keyUp?(key: string[]): void;
}