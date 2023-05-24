
import skinGame from "@/assets/images/skin/table/skin_Game-Over.png";
import skinSwag from "@/assets/images/skin/table/skin_swag.png";
import skinOnePiece from "@/assets/images/skin/table/skin_onepiece.jpg";



export class Table {
  width: number = 1000;
  height: number = 750;
  background: string;
  color: string;
  skin = new Image();

  constructor(width: number, height: number, background: string, color: string, skin?: string) {
    this.width = width;
    this.height = height;
    this.background = background;
    this.color = color;
    this.skin.src = skin ? skin : skinOnePiece;
  }

  draw(context: CanvasRenderingContext2D) {
    this.drawBackGround(context);
    this.drawTableColor(context);
    if (this.skin.src)
    {
      try {
        context.drawImage(this.skin, 78, 174, this.width - 158, this.height - 248);

      }
      catch {
        "";
      }
    }
    this.drawLines(context);
  }

  drawLines(context: CanvasRenderingContext2D) {
    context.fillStyle = "white";
    context.fillRect(78, this.height - 330, this.width - 154, 10);
    context.fillRect(this.width / 2 - 5, 152, 10, this.height - 205);
    context.fillStyle = "black";
    context.beginPath();
    context.arc(this.width / 2, 146, 20 / 2, 0, 360);
    context.arc(this.width / 2, this.height - 46, 20 / 2, 0, 360);
    context.fill();
    
 }

  drawTableColor(context: CanvasRenderingContext2D) {
    context.fillStyle = this.color;

    context.fillRect(78, 174, this.width - 158, this.height - 248);

    //context.fillRect(0, 164, 1000, 522); 
  }

  drawBackGround(context: CanvasRenderingContext2D) {
    context.fillStyle = this.background;
    context.fillRect(0, 0, this.width, this.height);
    context.fillStyle = "white";
    context.fillRect(68, 164, this.width - 138, this.height - 228);
  }
}
