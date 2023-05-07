import type { GameObject } from "./GameObject";

export class Character implements GameObject
{
    imagem: any = new Image();
    x: number = 100;
    y: number = 100;
    w: number = 100;
    h: number = 100;

    constructor(url: string)
    {
       this.imagem.src = "caminho/para/imagem.png";
    }


    draw(contex: CanvasRenderingContext2D): void {
        contex.drawImage(this.imagem, this.x, this.y);
    }
    
    update(): void {
        
    }

}