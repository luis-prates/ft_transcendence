import type { Rectangle } from "@/game";
import avatarMarvin from "@/assets/images/pingpong/marvin.jpg";


export class Shop {

	static radius: number = 10;
	static arrowHeight: number = 20;

	public static draw(ctx: CanvasRenderingContext2D, pos: Rectangle) {
		const backgroundColor = '#D2B48C'; // Cor de fundo castanho
		const borderColor = '#8B4513'; // Cor de contorno mais escuro
	  
		// Desenha o corpo do balão com cor de fundo castanho
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
		ctx.fillStyle = backgroundColor;
		ctx.fill();
	  
		// Desenha o contorno do balão com cor mais escura
		ctx.strokeStyle = borderColor;
		ctx.lineWidth = 2;
		ctx.stroke();
	  
		// Escreve "Shop" no topo do balão
		ctx.fillStyle = '#000';
		ctx.font = 'bold 20px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('Shop', pos.x + pos.w / 2, pos.y + 20);

		// Adiciona sublinhado ao título
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(pos.x + pos.w / 2 - 30, pos.y + 28); // Posição inicial do sublinhado
		ctx.lineTo(pos.x + pos.w / 2 + 30, pos.y + 28); // Posição final do sublinhado
		ctx.stroke();

		// Configurações para desenhar os quadrados de produtos
		const squareSize = pos.w / 10;
		const paddingX = pos.w / 12;
		const paddingY = pos.h / 10;
		const titleOffsetY = 20;
		const priceOffsetY = 40;
		const buttonOffsetY = 60;
		const buttonWidth = 40;
		const buttonHeight = 20;
	   
		// Loop para desenhar os quadrados de produtos
		for (let i = 0; i < 15; i++) {
		  const squareX = pos.x + paddingX + (i % 5) * (squareSize + paddingX);
		  const squareY = pos.y + paddingY + Math.floor(i / 5) * (squareSize + paddingY);
	   
		  // Desenha o quadrado com borda
		  ctx.fillStyle = '#fff';
		  ctx.strokeStyle = '#000';
		  ctx.lineWidth = 2;
		  ctx.fillRect(squareX, squareY, squareSize, squareSize);
		  ctx.strokeRect(squareX, squareY, squareSize, squareSize);
	   
		  // Desenha o título do produto acima do quadrado
		  ctx.fillStyle = '#000';
		  ctx.font = '12px Arial';
		  ctx.textAlign = 'center';
		  ctx.fillText(`Title ${i + 1}`, squareX + squareSize / 2, squareY + titleOffsetY);
	   
		  // Desenha o preço do produto abaixo do quadrado
		  ctx.fillStyle = '#000';
		  ctx.font = '12px Arial';
		  ctx.textAlign = 'center';
		  ctx.fillText(`Price: $${i + 1}`, squareX + squareSize / 2, squareY + priceOffsetY);
	   
		  // Desenha o botão "Buy" abaixo do preço do produto
		  ctx.fillStyle = '#000';
		  ctx.fillRect(
		 squareX + squareSize / 2 - buttonWidth / 2,
		 squareY + buttonOffsetY,
		 buttonWidth,
		 buttonHeight
		  );
		  ctx.fillStyle = '#fff';
		  ctx.font = '10px Arial';
		  ctx.textAlign = 'center';
		  ctx.fillText('BUY', squareX + squareSize / 2, squareY + buttonOffsetY + 12);
		}
		
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