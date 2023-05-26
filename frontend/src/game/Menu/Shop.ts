import { Menu, type ElementUI, type Rectangle } from "@/game";

//Paddle Skin
import skin_mario from "@/assets/images/skin/line/skin_Mario.jpeg";

//Table Skin
import skin_onepiece from "@/assets/images/skin/table/skin_onepiece.jpg";

//Sound
import sound_caching from "@/assets/audio/caching.mp3";
import sound_close_tab from "@/assets/audio/close.mp3";

export class Shop {

	menu = new Menu({ layer: "Global", isFocus: true });
	radius: number = 10;
	arrowHeight: number = 20;
	background: ElementUI = this.createBackground();
	products: ElementUI[] = [
		this.background,
		this.createButtonExit(10.5, 11),
	];

	constructor() {
		this.createAll();
	}

	private createBackground() : ElementUI {
		const background: ElementUI = {
			type: "image",
        	rectangle: { x: "10%", y: "10%", w: "80%", h: "80%"},
        	draw: (context: any) => {
          	this.draw(context, background.rectangle);
        	}
		}

		return background;
	}

	private createAll() {
		// Configurações para desenhar os quadrados de produtos
		const squareW = 10;
		const squareH = 15;
		const paddingX = 6;
		const paddingY = 9;
	   
		// Loop para desenhar os quadrados de produtos
		for (let i = 0; i < 15; i++) {
		  const squareX = 10 + 3 + (i % 5) * (squareW + paddingX);
		  const squareY = 10 + paddingY + Math.floor(i / 5) * (squareH + paddingY);

		  this.products.push(this.createProduct("Text " + i, "table", skin_onepiece, squareX, squareY));
		}
	}

	private createProduct(name: string, type: string, image_src: string, x: number, y: number) : ElementUI {
		const photo = new Image();
		const buy_sound = new Audio(sound_caching);
		photo.src = image_src;
		const product: ElementUI = {
			type: "image",
			rectangle: { x: x + "%", y:  y + "%", w: "10%", h: "15%" },
			draw: (ctx: CanvasRenderingContext2D) => {
				const offSetTittle = this.background.rectangle.y * 0.05;
				const offSetPrice = this.background.rectangle.y * 0.20;
				
		  		// Desenha o quadrado com borda
		  		ctx.fillStyle = 'DarkSlateBlue';
		  		ctx.strokeStyle = '#000';
		  		ctx.lineWidth = 2;
		  		ctx.fillRect(product.rectangle.x, product.rectangle.y, product.rectangle.w, product.rectangle.h);
		  		ctx.strokeRect(product.rectangle.x, product.rectangle.y, product.rectangle.w, product.rectangle.h);

				if (type == "table" && photo.complete)
				{
					const scaledWidth = product.rectangle.w * 0.80;
					const scaledHeight = product.rectangle.h * 0.78;
					const pointx = (product.rectangle.w - scaledWidth) / 2;
					const pointy = (product.rectangle.h - scaledHeight) / 2;

					ctx.fillStyle = "white";
					ctx.fillRect(product.rectangle.x + pointx - (this.background.rectangle.y * 0.78 * 0.015), product.rectangle.y + pointy - (this.background.rectangle.y * 0.78 * 0.015), scaledWidth + (this.background.rectangle.y * 0.78 * 0.03), scaledHeight + (this.background.rectangle.y * 0.78 * 0.03));
					
					if (photo.complete)
					  ctx.drawImage(photo, product.rectangle.x + pointx, product.rectangle.y + pointy, scaledWidth, scaledHeight);
					
					//Midle Line
					ctx.fillRect(product.rectangle.x + pointx, product.rectangle.y + pointy + (scaledHeight / 2 - this.background.rectangle.y * 0.78 * 0.01), scaledWidth, this.background.rectangle.y * 0.78 * 0.02);
					//Vertical
					ctx.fillRect(product.rectangle.x + (product.rectangle.w / 2 - this.background.rectangle.y * 0.78 * 0.01), product.rectangle.y + pointy, this.background.rectangle.y * 0.78 * 0.02, scaledHeight);
				}
				else if (type == "paddle" && photo.complete)
				{
					const scale = 100 / 30;
					const scaledWidth = product.rectangle.w * 0.15 * scale;
					const scaledHeight = product.rectangle.h * 0.30 * scale;
					const pointx = (product.rectangle.w - (scaledWidth * 0.5)) / 2;
					const pointy = (product.rectangle.h - (scaledHeight * 0.9)) / 2;

					if (photo.complete) {
						ctx.drawImage(photo, product.rectangle.x + pointx, product.rectangle.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);
					}

					ctx.strokeStyle = 'black';
					ctx.lineWidth = 3;
					ctx.strokeRect(product.rectangle.x + pointx, product.rectangle.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);
				}

		  		// Desenha o título do produto acima do quadrado
		  		ctx.fillStyle = '#000';
		  		ctx.font = '12px Arial';
		  		ctx.textAlign = 'center';
		  		ctx.fillText(name, product.rectangle.x + product.rectangle.w / 2, product.rectangle.y - offSetTittle);
			
		  		// Desenha o preço do produto abaixo do quadrado
		  		ctx.fillStyle = '#000';
		  		ctx.font = '12px Arial';
		  		ctx.textAlign = 'center';
		  		ctx.fillText("0,01€", product.rectangle.x + product.rectangle.w / 2, product.rectangle.y + product.rectangle.h + offSetPrice);
			},
			onClick: () => { buy_sound.play();  }
		}
		return product;
	}

	private createButtonExit(x: number, y: number) : ElementUI {
		const close_tab = new Audio(sound_close_tab);
		const button: ElementUI = {
			type: "exit",
			rectangle: { x: x + "%", y:  y + "%", w: "3%", h: "3%" },
			draw: (ctx: CanvasRenderingContext2D) => {
				
				ctx.strokeStyle = '#8B4513';
		  		ctx.strokeRect(button.rectangle.x, button.rectangle.y, button.rectangle.w , button.rectangle.h);

  				ctx.lineWidth = 3;

				ctx.beginPath();
				ctx.moveTo(button.rectangle.x + 5, button.rectangle.y + 5);
				ctx.lineTo(button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5 + button.rectangle.h - 10);
				ctx.stroke();
		  
				ctx.beginPath();
				ctx.moveTo(button.rectangle.x + 5, button.rectangle.y + 5 + button.rectangle.h - 10);
				ctx.lineTo(button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5);
				ctx.stroke();
			},
			onClick: () => { close_tab.play(); this.menu.close()/*Fechar o menu*/ },
			
		}
		return button;
	}

	public draw(ctx: CanvasRenderingContext2D, pos: Rectangle) {
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
		const squareSize = 8;
		const paddingX = 9.6;
		const paddingY = 8;
		const titleOffsetY = 20;
		const priceOffsetY = 40;
		const buttonOffsetY = 60;
		const buttonWidth = 40;
		const buttonHeight = 20;


	   
		// Loop para desenhar os quadrados de produtos
		/*for (let i = 0; i < 15; i++) {
		  const squareX = paddingX + (i % 5) * (squareSize + paddingX);
		  const squareY = pos.y + paddingY + Math.floor(i / 5) * (squareSize + paddingY);

		  this.products.push(this.createProduct("", "", "", 20 + 9.6 + squareX, squareY));
	   
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
		}*/
		
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