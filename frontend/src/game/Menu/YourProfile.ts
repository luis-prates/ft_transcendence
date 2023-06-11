import { Menu, type ElementUI, type Rectangle, Game, Player } from "@/game";
import { userStore, type Historic } from "@/stores/userStore";
import { Skin, TypeSkin } from "../ping_pong/Skin";
import { AnimationMenu } from "./AnimationMenu";

//Audio
import sound_close_tab from "@/assets/audio/close.mp3";

//Image
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";
import avatares from "@/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg"


export class YourProfile {
	private _menu = new Menu({ layer: "Global", isFocus: true });
	
	private background: ElementUI = this.createBackground();
	private customAvatar: ElementUI = this.createAvatar();	
	private customPaddle: ElementUI = this.createCustomPaddle();
	  
  	private user = userStore().user;
	private player: Player;
	private avatarImage = new Image();

	private matcheArrowL: string = "grey";
	private matcheArrowR: string = "grey";
	private page: number = 0;

	//MiniPerfil
	private skin = new Skin();
	private avataresImage = new Image();
	private chooseAvatar: number;
	private skinPadleImage: HTMLImageElement;
	private colorChoose: string = "";
	private skinPadle : string = "";
	private avatarArrowR: string = "white";
	private avatarArrowL: string = "white";



	constructor(player: Player) {

		this.player = player;

		this.avatarImage.src = this.user.infoPong.avatar ? this.user.infoPong.avatar : avatarDefault;

	    this.skinPadle = this.user.infoPong.skin.default.paddle;
   		 this.skinPadleImage = this.skin.get_skin(TypeSkin.Paddle + "_" + this.user.infoPong.skin.default.paddle);

		this.matcheArrowR = this.user.infoPong.historic.length > 4 ? "white" : "grey";

		this.avataresImage.src = avatares;
		this.chooseAvatar = Math.ceil((player.animation.sx / 48) / 3) + (player.animation.sy / 80);
		this.avatarArrowL = this.chooseAvatar == 0 ? "grey" : "white";
		this.avatarArrowR = this.chooseAvatar == 7 ? "grey" : "white";
	
		this.colorChoose = this.user.infoPong.color;
		this.skinPadle = this.user.infoPong.skin.default.paddle;
		this.skinPadleImage = this.skin.get_skin(TypeSkin.Paddle + "_" + this.user.infoPong.skin.default.paddle);



		this.menu.add(this.background);
		this.menu.add(this.background, this.createButtonExit(33.5, 6, "profile"));

		this.menu.add(this.background, this.createButtonCustom(35, 40, 40, "paddle"));
		this.menu.add(this.background, this.createButtonCustom(35, 5, 35, "avatar"));

		//Custom and Save Buttons
		this.menu.add(this.background, this.createButton("save", 13.25, 26, "Save", 9));

		const squareW = 10;
		const squareH = 8;
		const paddingX = 6;
		const paddingY = 12;

    	//Arrow Buttons
		this.menu.add(this.background, this.createArrowButton("left", 2.5, 33.5, 2));
		this.menu.add(this.background, this.createArrowButton("right", 30.5, 33.5, 2));
		
		this.user.infoPong.historic.forEach((matche, index) => {

			
			if ((index == 0 ? index + 1 : index) % 4 == 0)
				this.page++;
			
			const i = index - (this.page * 4);

			const squareX = 1 + (i % 2) * (squareW + paddingX);
			const squareY = 30 + paddingY + Math.floor(i / 2) * (squareH + paddingY);
			this.menu.add(this.background, this.createMatches(index, matche, squareX, squareY));
		});

		this.page = 0;

    	//Custom Menu
    	this.menu.add(this.background, this.customPaddle);
    	this.customPaddle.visible = false;
		
    	//Colors
    	this.menu.add(this.customPaddle, this.createColorButton(34.5 + 1 * (10 / 3), 53.5, "red"));
    	this.menu.add(this.customPaddle, this.createColorButton(34.5 + 2 * (10 / 3), 53.5, "#1e8c2f"));
    	this.menu.add(this.customPaddle, this.createColorButton(34.5 + 3 * (10 / 3), 53.5, "orange"));
    	this.menu.add(this.customPaddle, this.createColorButton(34.5 + 4 * (10 / 3), 53.5, "#de1bda"));
    	this.menu.add(this.customPaddle, this.createColorButton(34.5 + 5 * (10 / 3), 53.5, "blue"));
    	this.menu.add(this.customPaddle, this.createColorButton(34.5 + 6 * (10 / 3), 53.5, "#efc120"));
		
    	this.menu.add(this.customPaddle, this.createSkinButton(34.5 + 1 * (10 / 3), 66.5, ""));
    	this.user.infoPong.skin.paddles.forEach((skin, index) => {
    	  this.menu.add(this.customPaddle, this.createSkinButton(34.5 + (index + 2) * (10 / 3), 66.5, skin));
    	});

		//Custom Avatar
		this.menu.add(this.background, this.customAvatar);
    	this.customAvatar.visible = false;
	
		//Arrow Buttons
		this.menu.add(this.customAvatar, this.createArrowButton("left", 2.5, 31.5, 2));
		this.menu.add(this.customAvatar, this.createArrowButton("right", 7.5, 31.5, 2));

	}

	private createMatches(index: number, matche: Historic, x: number, y: number): ElementUI {

		const player1Image = new Image();
		const player2Image = new Image();

		const product: ElementUI = {
		  type: "image",
		  rectangle: { x: x + "%", y: y + "%", w: "15%", h: "15%" },
		  draw: (ctx: CanvasRenderingContext2D) => {

			const currPageStart = this.page * 4;
			const currPageEnd = ((this.page + 1) * 4) - 1;

			if (!(currPageStart <= index && index <= currPageEnd))
				return;			

			const offSetTittle = this.background.rectangle.y * 1.75;
	
			ctx.fillStyle = "silver";
			ctx.strokeStyle = "#000";
			ctx.lineWidth = 2;
	
			this.roundRect(ctx, product.parent?.rectangle.x + product.rectangle.x, product.rectangle.y, product.rectangle.w, product.rectangle.h, 10);
	
			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "#000";
			ctx.font = "20px 'Press Start 2P', cursive";

			//Regua Vertical
			/*ctx.strokeRect(product.rectangle.x + ((product.rectangle.w) / 2), product.rectangle.y, 1, product.rectangle.h + + product.rectangle.w * 0.07);
			ctx.strokeRect(product.rectangle.x + (product.rectangle.w + product.rectangle.w * 0.07) / 3, product.rectangle.y, 1, product.rectangle.h + + product.rectangle.w * 0.07);
			ctx.strokeRect((product.rectangle.x + product.rectangle.w) - (product.rectangle.w + product.rectangle.w * 0.07) / 3, product.rectangle.y, 1, product.rectangle.h + + product.rectangle.w * 0.07);
			*/
			//Regua Horizontal
			/*ctx.strokeRect(product.rectangle.x + product.rectangle.w * 0.05, product.rectangle.y + product.rectangle.h * 0.9, product.rectangle.w * 0.3, 1);
			ctx.strokeRect(product.rectangle.x + product.rectangle.w * 0.65, product.rectangle.y + product.rectangle.h * 0.9, product.rectangle.w * 0.3, 1);
			ctx.strokeRect(product.rectangle.x + product.rectangle.w * 0.35, product.rectangle.y + product.rectangle.h * 0.2, product.rectangle.w * 0.3, 1);
			*/

			ctx.fillText(matche.result, product.parent?.rectangle.x + 
			product.rectangle.x + product.rectangle.w / 2.625, product.rectangle.y + offSetTittle, product.rectangle.w * 0.25);

			ctx.fillText(matche.player1, product.parent?.rectangle.x + 
				product.rectangle.x + product.rectangle.w * 0.05, product.rectangle.y + product.rectangle.h * 0.9, product.rectangle.w * 0.3);

			ctx.fillText(matche.player2, product.parent?.rectangle.x + 
				product.rectangle.x + product.rectangle.w * 0.65, product.rectangle.y + product.rectangle.h * 0.9, product.rectangle.w * 0.3);
		  
			 // matche.player1 
			player1Image.src = matche.player1 == this.user.nickname ? this.user.infoPong.avatar : avatarDefault;
			player2Image.src = matche.player2 == this.user.nickname ? this.user.infoPong.avatar : avatarDefault;

			ctx.strokeRect(product.parent?.rectangle.x + product.rectangle.x + product.rectangle.w * 0.095, product.rectangle.y + product.rectangle.h * 0.3, product.rectangle.w * 0.20, product.rectangle.h * 0.35);
			ctx.strokeRect(product.parent?.rectangle.x + (product.rectangle.x + product.rectangle.w) - (product.rectangle.w * 0.295), product.rectangle.y + product.rectangle.h * 0.3, product.rectangle.w * 0.20, product.rectangle.h * 0.35);

			ctx.drawImage(player2Image, product.parent?.rectangle.x + product.rectangle.x + product.rectangle.w * 0.095, product.rectangle.y + product.rectangle.h * 0.3, product.rectangle.w * 0.20, product.rectangle.h * 0.35);
			ctx.drawImage(player2Image, product.parent?.rectangle.x + (product.rectangle.x + product.rectangle.w) - (product.rectangle.w * 0.295), product.rectangle.y + product.rectangle.h * 0.3, product.rectangle.w * 0.20, product.rectangle.h * 0.35);

			/*if (player1Image.complete) 
			else {
				player1Image.src = avatarDefault;
				ctx.drawImage(player1Image, product.rectangle.x + product.parent?.rectangle.w * 0.5, product.rectangle.y, product.rectangle.w, product.rectangle.h);
			}*/

			/*if (player2Image.complete) ctx.drawImage(player2Image, product.rectangle.x + this.background.rectangle.x * 0.25, product.rectangle.y, this.background.rectangle.x * 2, this.background.rectangle.y * 1.75);
			else {
				player2Image.src = avatarDefault;
				ctx.drawImage(player2Image, product.rectangle.w - this.background.rectangle.x * 1.25, product.rectangle.y, this.background.rectangle.x * 2, this.background.rectangle.y * 1.75);
			}*/
			ctx.lineWidth = 5;
			ctx.strokeText(matche.winner == this.user.nickname ? "WIN!" : "LOSE.", product.parent?.rectangle.x + 
				product.rectangle.x + product.rectangle.w * 0.35, product.rectangle.y + product.rectangle.h * 0.12, product.rectangle.w * 0.3)
			ctx.fillStyle = matche.winner == this.user.nickname ? "gold" : "grey";
			ctx.fillText(matche.winner == this.user.nickname ? "WIN!" : "LOSE.", product.parent?.rectangle.x + 
				product.rectangle.x + product.rectangle.w * 0.35, product.rectangle.y + product.rectangle.h * 0.12, product.rectangle.w * 0.3);
			
		},
		  onClick: () => {
	
		  },
		};
		return product;
	}	

	private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
	  const r = x + width;
	  const b = y + height;
	  ctx.beginPath();
	  ctx.moveTo(x + radius, y);
	  ctx.lineTo(r - radius, y);
	  ctx.quadraticCurveTo(r, y, r, y + radius);
	  ctx.lineTo(r, y + height - radius);
	  ctx.quadraticCurveTo(r, b, r - radius, b);
	  ctx.lineTo(x + radius, b);
	  ctx.quadraticCurveTo(x, b, x, b - radius);
	  ctx.lineTo(x, y + radius);
	  ctx.quadraticCurveTo(x, y, x + radius, y);
	  ctx.closePath();
	}

	private createBackground(): ElementUI {
		/*const animation = new AnimationMenu();
		let animation_finish = false;*/
	  	const background: ElementUI = {
			type: "image",
			rectangle: { x: "0%", y: "5%", w: "35%", h: "75%" },
			draw: (context: any) => {
				this.drawBackground(context, background.rectangle);
				//animation_finish = animation.animation(background.rectangle.x - background.rectangle.w, background.rectangle.x, 0, background);
				
			},
	  	};
	  	return background;
	}

	private createButton(type: string, x: number, y: number, label: string, width: number): ElementUI {
	  let color = "black";
	  const button: ElementUI = {
		type: type,
		rectangle: { x: x + "%", y: y + "%", w: width + "%", h: "4.5%" },
		draw: (ctx: CanvasRenderingContext2D) => {
		
			ctx.fillStyle = "white";
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;

			this.roundRect(ctx, button.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, 10);

			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "black";
			ctx.font = "10px 'Press Start 2P', cursive";

			const begin = button.parent?.rectangle.x + button.rectangle.x + button.rectangle.w * 0.1;
			const max_with = button.rectangle.w - (button.rectangle.w * 0.2);

			let offset = 0;
			let offsetmax = 0;
			const labelWidth = ctx.measureText(label).width;
			while (begin + offset + labelWidth < begin + max_with - offset)
			{
				offsetmax += button.rectangle.w * 0.05;
				if (begin + offsetmax + labelWidth > begin + max_with - offset)
					break ;
				offset = offsetmax;
			}

			ctx.fillText(label, 
			button.parent?.rectangle.x + button.rectangle.x + button.rectangle.w * 0.1 + offset,
			button.rectangle.y + button.rectangle.h / 2 + 6, 
			button.rectangle.w - (button.rectangle.w * 0.2) - offset);
			},
			onClick: () => {
			if (type == "challenge") {
			  //TODO Created table and send challenge
			  /*const confirmButton = new CreateGame(this.player);
			  confirmButton.show((value) => {
			  if (value == "CONFIRM") buy_sound.play();
				}); */
			}
			else if (type == "send_message") {
			  //TODO send priv message
			}
			else if (type == "mute") {
			  //TODO mute or unmute
			}
			},
	  };
	  return button;
	}

	private drawBackground(ctx: CanvasRenderingContext2D, pos: Rectangle) {
	  const backgroundColor = "rgba(210, 180, 140, 0.6)";
	  const borderColor = "black";

	  ctx.fillStyle = backgroundColor;
	  this.roundRect(ctx, pos.x, pos.y, pos.w, pos.h, 10);
	  ctx.fill();

	  ctx.strokeStyle = borderColor;
	  ctx.lineWidth = 2;
	  ctx.stroke();

	  
    //NickName
    ctx.fillStyle = 'black';
    ctx.font = "22px 'Press Start 2P', cursive";
	  ctx.fillText(this.user.nickname, pos.x + pos.w * 0.30, pos.y + pos.h * 0.10, pos.w - (pos.x + pos.w * 0.5));

    //Level
    ctx.font = "12px 'Press Start 2P', cursive";
	ctx.fillText("Level: " + this.user.infoPong.level, pos.x + pos.w * 0.30, pos.y + pos.h * 0.13, pos.w - (pos.x + pos.w * 0.5));

	//Money
	ctx.fillText("Money: " + this.user.wallet + "₳", pos.x + pos.w * 0.30, pos.y + pos.h * 0.16, pos.w - (pos.x + pos.w * 0.5));
    
	//Level
	const wins = this.user.infoPong.historic.filter((history: any) => history.winner == this.user.nickname).length;
	ctx.fillText("Wins:  " + wins, pos.x + pos.w * 0.30, pos.y + pos.h * 0.19, pos.w - (pos.x + pos.w * 0.5));

	const loses = this.user.infoPong.historic.filter((history: any) => history.loser == this.user.nickname).length
	ctx.fillText("Loses: " + loses, pos.x + pos.w * 0.30, pos.y + pos.h * 0.22, pos.w - (pos.x + pos.w * 0.5));

    //Avatar

	ctx.strokeStyle = "black";
	ctx.lineWidth = 5;
	ctx.strokeRect(
      pos.x + pos.w * 0.05, 
      pos.y + pos.h * 0.05,
      pos.w * 0.2,
      pos.h * 0.2,
      );

	  try {
		ctx.drawImage(this.avatarImage, pos.x + pos.w * 0.05, 
			pos.y + pos.h * 0.05,
			pos.w * 0.2,
			pos.h * 0.2,);
	  }
	  catch {
		this.avatarImage.src = avatarDefault;
		ctx.drawImage(this.avatarImage, pos.x + pos.w * 0.05, 
			pos.y + pos.h * 0.05,
			pos.w * 0.2,
			pos.h * 0.2,);
	  }

		//Paddle
		const scale = 100 / 30;
        const scaledWidth = pos.w * 0.035 * scale;
        const scaledHeight = pos.h * 0.055 * scale;
        const pointx = (pos.w - pos.w * 0.15);
        const pointy = (pos.h* 0.07);
        
        ctx.fillStyle = this.colorChoose;
        ctx.fillRect(pos.x + pointx, pos.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);

        if (this.skinPadleImage.complete) {
          ctx.drawImage(this.skinPadleImage, pos.x + pointx, pos.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);
        }
          
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.strokeRect(pos.x + pointx, pos.y + pointy, scaledWidth * 0.5, scaledHeight * 0.9);
 

	  //Matches
	  ctx.font = "22px 'Press Start 2P', cursive";
	  ctx.lineWidth = 4;
      ctx.strokeStyle = "black";
	  ctx.strokeText("Matches", pos.x + pos.w * 0.35, pos.y + pos.h * 0.425, pos.w * 0.275);

	  ctx.lineWidth = 3;

      ctx.fillStyle = "white";
	  ctx.fillText("Matches", pos.x + pos.w * 0.35, pos.y + pos.h * 0.425, pos.w * 0.275);
        
    /*if (this.avataresImage.complete) ctx.drawImage(this.avataresImage, 
      ((this.chooseAvatar - 4 >= 0 ? this.chooseAvatar - 4 : this.chooseAvatar) * 144) + 48, //+3
      (this.chooseAvatar - 4 >= 0 ? 1 : 0) * 320, //+4
      48, 80,
      pos.x + pos.w * 0.05, 
      pos.y + pos.h * 0.04,
      pos.w * 0.4,
      pos.h * 0.80);*/
	}

	private createButtonExit(x: number, y: number, type: string): ElementUI {
	  const close_tab = new Audio(sound_close_tab);
	  const button: ElementUI = {
		type: type,
		rectangle: { x: x + "%", y: y + "%", w: "1%", h: "2%" },
		draw: (ctx: CanvasRenderingContext2D) => {
		  ctx.fillStyle = "red";
		  ctx.strokeStyle = "black";
		  ctx.fillRect(button.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);
		  ctx.strokeRect(button.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);

		  ctx.lineWidth = 3;

		  ctx.beginPath();
		  ctx.moveTo(button.parent?.rectangle.x + button.rectangle.x + 5, button.rectangle.y + 5);
		  ctx.lineTo(button.parent?.rectangle.x + button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5 + button.rectangle.h - 10);
		  ctx.stroke();

		  ctx.beginPath();
		  ctx.moveTo(button.parent?.rectangle.x + button.rectangle.x + 5, button.rectangle.y + 5 + button.rectangle.h - 10);
		  ctx.lineTo(button.parent?.rectangle.x + button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5);
		  ctx.stroke();
		},
		onClick: () => {
		  close_tab.play();
		  if (button.type == "profile") this.menu.close();
		},
	  };
	  return button;
	}

	private createButtonCustom(x: number, y: number, h: number, type: string): ElementUI {
		const close_tab = new Audio(sound_close_tab);
		const button: ElementUI = {
		  type: type,
		  rectangle: { x: x + "%", y: y + "%", w: "2%", h: h + "%" },
		  draw: (ctx: CanvasRenderingContext2D) => {
			ctx.fillStyle = "white";
			ctx.strokeStyle = "black";
			ctx.lineWidth = 2;

			this.roundRect(ctx, button.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, 10);

			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "black";
			ctx.font = "10px 'Press Start 2P', cursive";

			const begin = button.parent?.rectangle.x + button.rectangle.x + button.rectangle.w * 0.1;
			const max_with = button.rectangle.w - (button.rectangle.w * 0.2);

			let offset = 0;
			let offsetmax = 0;
			const labelWidth = ctx.measureText(type).width;
			while (begin + offset + labelWidth < begin + max_with - offset)
			{
				offsetmax += button.rectangle.w * 0.05;
				if (begin + offsetmax + labelWidth > begin + max_with - offset)
					break ;
				offset = offsetmax;
			}

			ctx.fillText(type, 
			button.parent?.rectangle.x + button.rectangle.x + button.rectangle.w * 0.1 + offset,
			button.rectangle.y + button.rectangle.h / 2 + 6, 
			button.rectangle.w - (button.rectangle.w * 0.2) - offset);
		  },
		  onClick: () => {
			close_tab.play();
			if (button.type == "avatar") 
			{
				this.customAvatar.visible = !this.customAvatar.visible;	
				button.rectangle.x = (this.customAvatar.visible ? button.rectangle.x + button.parent?.rectangle.w * 0.28 : button.rectangle.x - (button.parent?.rectangle.w * 0.28));
			}
			else if (button.type == "paddle") 
			{
				this.customPaddle.visible = !this.customPaddle.visible;
				button.rectangle.x = (this.customPaddle.visible ? 60 : 35);
			}
		  },
		};
		return button;
	  }
	
	private createArrowButton(type: string, x: number, y: number, width: number): ElementUI {
		const button: ElementUI = {
		  type: type,
		  rectangle: { x: x + "%", y: y + "%", w: width + "%", h: "4%" },
		  draw: (ctx: CanvasRenderingContext2D) => {
			 
			  ctx.strokeStyle = "black"; // Definir a cor do sublinhado preto
			  ctx.fillStyle = button.type == "right" ? this.matcheArrowR : this.matcheArrowL;
	
			  const arrowSize = Math.min(button.rectangle.w, button.rectangle.h); 
	
			  if (type == "right") {
				ctx.beginPath();
				ctx.moveTo(button.parent?.rectangle.x + button.rectangle.x + button.rectangle.w, button.rectangle.y + button.rectangle.h / 2);
				ctx.lineTo(button.parent?.rectangle.x + button.rectangle.x + button.rectangle.w - arrowSize, button.rectangle.y);
				ctx.lineTo(button.parent?.rectangle.x + button.rectangle.x + button.rectangle.w - arrowSize, button.rectangle.y + button.rectangle.h);
				ctx.closePath();
			  } else if (type == "left") {
				ctx.beginPath();
				ctx.moveTo(button.parent?.rectangle.x + button.rectangle.x, button.rectangle.y + button.rectangle.h / 2);
				ctx.lineTo(button.parent?.rectangle.x + button.rectangle.x + arrowSize, button.rectangle.y);
				ctx.lineTo(button.parent?.rectangle.x + button.rectangle.x + arrowSize, button.rectangle.y + button.rectangle.h);
				ctx.closePath();
			  }
			  ctx.fill();
			  ctx.stroke();
			  },
			  onClick: () => {
				if (type === "left" && this.page > 0) this.page--;
				else if (type === "right" && ((this.page + 1) * 4) - 1 < this.user.infoPong.historic.length - 1) this.page++;

			  	if (this.page == 0) this.matcheArrowL = "grey";
			  	else this.matcheArrowL = "white";
				
			  	if (((this.page + 1) * 4) - 1 >= this.user.infoPong.historic.length - 1) this.matcheArrowR = "grey";
			  	else this.matcheArrowR = "white";
			  },
		};
		return button;
	  }

	private createAvatar(): ElementUI {
		const avatar: ElementUI = {
		  type: "image",
		  rectangle: { x: "35%", y: "5%", w: "10%", h: "35%" },
		  draw: (context: any) => {
			const pos : Rectangle = avatar.rectangle;
			const backgroundColor = 'rgba(210, 180, 140, 0.6)';
			const borderColor = "black";
		
			context.fillStyle = backgroundColor;
			this.roundRect(context, pos.x, pos.y, pos.w, pos.h, 10);
			context.fill();
		
			context.strokeStyle = borderColor;
			context.lineWidth = 2;
			context.stroke();
		
			//Avatar
			context.strokeStyle = "black";
			context.strokeRect(
			  pos.x + pos.w * 0.10, 
			  pos.y + pos.h * 0.1,
			  pos.w * 0.8,
			  pos.h * 0.80,
			  );
			  
			context.fillStyle = 'rgba(0, 0, 0, 0.3)';
		
			context.fillRect(
				pos.x + pos.w * 0.10, 
				pos.y + pos.h * 0.1,
				pos.w * 0.8,
				pos.h * 0.80,
				);
			context.fillStyle = "white";
				
			if (this.avataresImage.complete) context.drawImage(this.avataresImage, 
			  ((this.chooseAvatar - 4 >= 0 ? this.chooseAvatar - 4 : this.chooseAvatar) * 144) + 48, //+3
			  (this.chooseAvatar - 4 >= 0 ? 1 : 0) * 320, //+4
			  48, 80,
			  pos.x + pos.w * 0.10, 
			  pos.y + pos.h * 0.04,
			  pos.w * 0.8,
			  pos.h * 0.80);
		  },
		};
		return avatar;
	}

	private createCustomPaddle(): ElementUI {
		const custom: ElementUI = {
		  type: "custom",
		  rectangle: { x: "35%", y: "40%", w: "25%", h: "40%" },
		  draw: (context: any) => {
			const backgroundColor = 'rgba(210, 180, 140, 0.6)';//"#FFC857";
			const borderColor = "black";
		
			context.fillStyle = backgroundColor;
			this.roundRect(context, custom.rectangle.x, custom.rectangle.y, custom.rectangle.w, custom.rectangle.h, 10);
			context.fill();
		
			context.strokeStyle = borderColor;
			context.lineWidth = 2;
			context.stroke();
		
			//Tittle
			context.fillStyle = "#ffffff";
			context.font = "25px 'Press Start 2P', cursive";
			context.lineWidth = 4;
			context.strokeText("Custom", custom.rectangle.x + custom.rectangle.w / 3, custom.rectangle.y + custom.rectangle.h * 0.125);
			context.fillText("Custom", custom.rectangle.x + custom.rectangle.w / 3, custom.rectangle.y + custom.rectangle.h * 0.125);
		
			context.textAlign = "start";
			//Type
			context.fillStyle = "black";
			context.font = "18px 'Press Start 2P', cursive";
			context.fillText("Color:", custom.rectangle.x + custom.rectangle.w * 0.4, custom.rectangle.y + custom.rectangle.h * 0.285);
		
			//Skin
			context.fillText("Skin:", custom.rectangle.x + custom.rectangle.w * 0.41, custom.rectangle.y + custom.rectangle.h * 0.625);
		
		  },
		};
		return custom;
	}
	
	private createColorButton(x: number, y: number, color: string): ElementUI {
		const button: ElementUI = {
		  type: "color",
		  rectangle: { x: x + "%", y: y + "%", w: "2.5%", h: "6%" },
		  draw: (ctx: CanvasRenderingContext2D) => {
			ctx.fillStyle = color;
			ctx.strokeStyle = color == this.colorChoose ? "red" : "black";
			ctx.lineWidth = 2;
	
			this.roundRect(ctx, button.parent?.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, 10);
	
			ctx.fill();
			ctx.stroke();
		  },
		  onClick: () => {
			this.colorChoose = color;
		  },
		};
		return button;
	}
	
	private createSkinButton(x: number, y: number, skin: string): ElementUI {
		const skinImage = this.skin.get_skin(TypeSkin.Paddle + "_" + skin);
		const button: ElementUI = {
		  type: "skin",
		  rectangle: { x: x + "%", y: y + "%", w: "2.5%", h: "12%" },
		  draw: (ctx: CanvasRenderingContext2D) => {
	
			ctx.strokeStyle = skin == this.skinPadle ? "red" : "black";
			ctx.lineWidth = 2;
	
			ctx.lineWidth = 3;
			
			if (skin == "") {
			  ctx.beginPath();
			  ctx.moveTo(button.parent?.parent?.rectangle.x + button.rectangle.x + 5, button.rectangle.y + 5);
			  ctx.lineTo(button.parent?.parent?.rectangle.x + button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5 + button.rectangle.h - 10);
			  ctx.stroke();
	
			  ctx.beginPath();
			  ctx.moveTo(button.parent?.parent?.rectangle.x + button.rectangle.x + 5, button.rectangle.y + 5 + button.rectangle.h - 10);
			  ctx.lineTo(button.parent?.parent?.rectangle.x + button.rectangle.x + 5 + button.rectangle.w - 10, button.rectangle.y + 5);
			  ctx.stroke();
			} else if (skinImage.complete) {
			  ctx.save();
	
			  ctx.beginPath();
			  ctx.moveTo(button.parent?.parent?.rectangle.x + button.rectangle.x + 10, button.rectangle.y);
			  ctx.arcTo(button.parent?.parent?.rectangle.x + button.rectangle.x + button.rectangle.w, button.rectangle.y, button.rectangle.x + button.rectangle.w, button.rectangle.y + button.rectangle.h, 10);
			  ctx.arcTo(button.parent?.parent?.rectangle.x + button.rectangle.x + button.rectangle.w, button.rectangle.y + button.rectangle.h, button.rectangle.x, button.rectangle.y + button.rectangle.h, 10);
			  ctx.arcTo(button.parent?.parent?.rectangle.x + button.rectangle.x, button.rectangle.y + button.rectangle.h, button.rectangle.x, button.rectangle.y, 10);
			  ctx.arcTo(button.parent?.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.x + button.rectangle.w, button.rectangle.y, 10);
			  ctx.closePath();
			  ctx.clip();
			  ctx.drawImage(skinImage, button.parent?.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h);
	
			  ctx.restore();
			}
	
			this.roundRect(ctx, button.parent?.parent?.rectangle.x + button.rectangle.x, button.rectangle.y, button.rectangle.w, button.rectangle.h, 10);
	
			ctx.stroke();
		  },
		  onClick: () => {
			this.skinPadle = skin;
			this.skinPadleImage = skinImage;
		  },
		};
		return button;
	}

	get menu(): Menu {
	  return this._menu;
	}

}