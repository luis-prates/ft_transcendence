import type { Rectangle } from "@/game";

export class SpeechBubble {

	static radius: number = 10;
	static arrowHeight: number = 20;

	
	static rectangleDimesion(message: string, x: number, y: number): Rectangle {

		const maxW = 300;
		const maxH = 100;
		const marginX = 17;
		const marginY = 70;
	  
		let length = message.length;
		let messageW = length * 6 + 20;
		let messageH = 32;
	  
		while (messageW > maxW || messageH > maxH) {
		  length -= 1;
		  messageW = length * 6 + 20;
		  messageH = Math.ceil(length / 46) * 22 + 12 + 20;
		}
	  
		const posX = x - messageW / 2 + marginX;
		const posY = y - messageH / 2 - marginY;
	  
		return { x: posX, y: posY, w: messageW, h: messageH};
	}

  	public static draw(ctx: CanvasRenderingContext2D, pos: Rectangle, message: string) {

		//ctx.clearRect(0, 0, 400, 200);
	
		// Desenha o corpo do balão
		ctx.beginPath();
		ctx.moveTo(pos.x + this.radius, pos.y);
		ctx.lineTo(pos.x + pos.w - this.radius, pos.y);
		ctx.quadraticCurveTo(pos.x + pos.w, pos.y, pos.x + pos.w, pos.y + this.radius);
		ctx.lineTo(pos.x + pos.w, pos.y + pos.h - this.radius);
		ctx.quadraticCurveTo(pos.x + pos.w, pos.y + pos.h, pos.x + pos.w - this.radius, pos.y + pos.h);
		ctx.lineTo(pos.x + this.radius, pos.y + pos.h);
		ctx.quadraticCurveTo(pos.x, pos.y + pos.h, pos.x, pos.y + pos.h - this.radius);
		ctx.lineTo(pos.x, pos.y + this.radius);
		ctx.quadraticCurveTo(pos.x, pos.y, pos.x + this.radius, pos.y);
		ctx.closePath();
		ctx.fillStyle = '#fff';
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.fill();
		ctx.stroke();

		// Desenha a seta do balão
		ctx.beginPath();
		ctx.moveTo(pos.x + pos.w / 2 - this.arrowHeight / 2, pos.y + pos.h);
		ctx.lineTo(pos.x + pos.w / 2, pos.y + pos.h + this.arrowHeight);
		ctx.lineTo(pos.x + pos.w / 2 + this.arrowHeight / 2, pos.y + pos.h);
		ctx.closePath();
		ctx.fillStyle = '#fff';
		ctx.fill();
		ctx.stroke();

		this.drawMessage(ctx, pos, message);
  }

  private static drawMessage(ctx: CanvasRenderingContext2D, pos: Rectangle, message: string) {
	ctx.font = "12px Arial";
	ctx.fillStyle = "black";
  
	const words = message.split(" ");
	const lineLength = 46; // Comprimento máximo da linha
  
	let line = 0;
	let currentLine = "";
	for (let i = 0; i < words.length; i++) {
	  const word = words[i];
	  const testLine = currentLine + word + " ";
  
	  if (testLine.length > lineLength) {
		ctx.fillText(currentLine, pos.x + 10, pos.y + 20 + line);
		currentLine = word + " ";
		line += 16; // Ajuste a altura da nova linha conforme necessário
	  } else {
		currentLine = testLine;
	  }
	}
  
	ctx.fillText(currentLine, pos.x + 10, pos.y + 20 + line);
  }
}