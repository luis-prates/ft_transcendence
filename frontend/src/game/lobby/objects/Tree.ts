import type { GameObject, GameObjectType } from "@/game/base/GameObject";
import { Game, Map } from "@/game";
import tree from "@/assets/images/lobby/tree_1.png";

export class Tree implements GameObject {
  type: GameObjectType = "tree";
  imagem: any;
  x: number = 0;
  y: number = 0;
  w: number = 0;
  h: number = 0;
  objectId: number = 0;
  isSelect: boolean = false;
  private positionDraw: { x: number; y: number } = { x: 0, y: 0 };
  private collisionBox: { x: number; y: number; w: number; h: number } = { x: 0, y: 0, w: 0, h: 0 };

  constructor(data: { x: number; y: number }) {
    this.setData(data);
    this.imagem = new Image();
    this.imagem.src = tree;
    this.imagem.onload = () => {
      this.w = this.imagem.width;
      this.h = this.imagem.height;
      this.positionDraw = { x: this.x - this.w / 2 + Map.SIZE / 2, y: this.y - this.h + Map.SIZE };
      this.collisionBox = { x: this.positionDraw.x, y: this.positionDraw.y, w: this.w, h: this.h - Map.SIZE };
    };
    Game.Map.grid[Math.floor(this.x / Map.SIZE)][Math.floor(this.y / Map.SIZE)] = 1;
  }

  draw(contex: CanvasRenderingContext2D): void {
    if (this.isCollision(Game.getPlayer())) contex.globalAlpha = 0.5;
    contex.drawImage(this.imagem, this.positionDraw.x, this.positionDraw.y);
    contex.globalAlpha = 1;
    contex.strokeStyle = "blue";
    contex.strokeRect(this.collisionBox.x, this.collisionBox.y, this.collisionBox.w, this.collisionBox.h);
  }

  setData(data: any): void {
    this.x = data.x;
    this.y = data.y;
  }

  getPointEvent(): { x: number; y: number } {
    return { x: this.x - 32, y: this.y - 15 };
  }

  destroy(): void {
    Game.Map.grid[Math.floor(this.x / Map.SIZE)][Math.floor(this.y / Map.SIZE)] = 0;
  }

  isCollision(gameObject: GameObject): boolean {
    return (
      this.collisionBox.x < gameObject.x + gameObject.w &&
      this.collisionBox.x + this.collisionBox.w > gameObject.x &&
      this.collisionBox.y < gameObject.y + gameObject.h &&
      this.collisionBox.y + this.collisionBox.h > gameObject.y
    );
  }

  interaction(gameObject: GameObject): void {
    console.log("tree -> interaction", gameObject);
  }
}
