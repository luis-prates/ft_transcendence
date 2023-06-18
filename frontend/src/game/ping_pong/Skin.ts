//Paddle
import skin_paddle_Pacman from "@/assets/images/skin/line/skin_Pac-Man.png";
import skin_paddle_Mario from "@/assets/images/skin/line/skin_Mario.jpeg";
import skin_paddle_OnePiece from "@/assets/images/skin/line/skin_OnePiece.png";
import skin_paddle_42Lisboa from "@/assets/images/skin/line/42-Lisboa.png";

//Table
import skin_table_Game from "@/assets/images/skin/table/skin_Game-Over.png";
import skin_table_Swag from "@/assets/images/skin/table/skin_swag.png";
import skin_table_OnePiece from "@/assets/images/skin/table/skin_onepiece.jpg";


export enum TypeSkin {
	Paddle,
	Table,
}

export interface ProductSkin {
	id: string,
    name: string,
	tittle: string,
    price: number,
    type: TypeSkin,
	image: HTMLImageElement,
  };

class Skin {
	public skins: ProductSkin [] = [];

	constructor() {
		this.skins.push(
			this.createSkin("onepiece", "One Piece", 3, TypeSkin.Paddle),
			this.createSkin("pacman", "PacMan", 5, TypeSkin.Paddle),
			this.createSkin("mario", "Mario and Friends", 6, TypeSkin.Paddle),
			this.createSkin("42Lisboa", "42 Lisboa", 0, TypeSkin.Paddle),
			this.createSkin("onepiece", "Luffy", 10, TypeSkin.Table),
			this.createSkin("swag", "Swag", 5, TypeSkin.Table),
			this.createSkin("game", "Game Over", 5, TypeSkin.Table),
		)
	}

	private createSkin(name: string, tittle: string, price: number, type: TypeSkin): ProductSkin {
		const id = type + "_" + name;
		const image = new Image();
		image.src = type == TypeSkin.Paddle ? this.skinPaddleChoose(name) : this.skinTableChoose(name);
		const newSkin: ProductSkin = {
			id: id,
			name: name,
			tittle: tittle,
			price: price,
			type: type,
			image: image,
		}
		return newSkin;
	}

	private skinPaddleChoose(name: string): string {
    	if (name == "onepiece") return skin_paddle_OnePiece;
    	else if (name == "pacman") return skin_paddle_Pacman;
    	else if (name == "mario") return skin_paddle_Mario;
    	else if (name == "42Lisboa") return skin_paddle_42Lisboa;
    	return "";
  	}

	private skinTableChoose(name: string): string {
		if (name == "onepiece") return skin_table_OnePiece;
		else if (name == "swag") return skin_table_Swag;
		else if (name == "game") return skin_table_Game;
		return "";
	}

	public get_skin(id: string): HTMLImageElement {
		const skin = this.skins.find((skin) => skin.id === id);
	  
		if (skin) return skin.image;
		return new Image();
	}
}

export const skin = new Skin()