import type { ElementUI, Menu } from "./Menu";
import sound_close_tab from "@/assets/audio/close.mp3";

export class PaginationMenu {

	menu: Menu | undefined; 
	parent: ElementUI | undefined;
	array: any = [];
	page: number = 0;
	max_for_page: number = 0;
	max_for_line: number = 0;
	arrowL: string = "grey";
	arrowR: string = "grey";
	close_tab = new Audio(sound_close_tab);


	constructor (array: any[], max_page: number, max_line: number, parent?: ElementUI | undefined, menu?: Menu)
	{
		this.menu = menu;
		this.parent = parent;
		this.max_for_page = max_page;
		this.max_for_line = max_line;
		this.array = array;
		this.arrowR = array.length > max_page ? "white" : "grey";
		this.arrowL = this.page > 0 ? "white" : "grey";
	}


	public createArrowButton(dir: string, x: number, y: number, width: number): ElementUI {
		const button: ElementUI = {
		  type: dir,
		  rectangle: { x: x + "%", y: y + "%", w: width + "%", h: "4%" },
		  draw: (ctx: CanvasRenderingContext2D) => {

			if (this.parent?.visible == false)
				return ;
			
			this.arrowR = ((this.page + 1) * this.max_for_page - 1 >= this.array.length - 1) ? "grey" : "white";
			this.arrowL = this.page > 0 ? "white" : "grey";

			ctx.lineWidth = 2;
			ctx.strokeStyle = "black";
			ctx.fillStyle = dir == "right" ? this.arrowR : this.arrowL;
			

			const arrowSize = Math.min(button.rectangle.w, button.rectangle.h);
	
			if (dir == "right") {
			  ctx.beginPath();
			  ctx.moveTo(button.rectangle.x + button.rectangle.w, button.rectangle.y + button.rectangle.h / 2);
			  ctx.lineTo(button.rectangle.x + button.rectangle.w - arrowSize, button.rectangle.y);
			  ctx.lineTo(button.rectangle.x + button.rectangle.w - arrowSize, button.rectangle.y + button.rectangle.h);
			  ctx.closePath();
			} else if (dir == "left") {
			  ctx.beginPath();
			  ctx.moveTo(button.rectangle.x, button.rectangle.y + button.rectangle.h / 2);
			  ctx.lineTo(button.rectangle.x + arrowSize, button.rectangle.y);
			  ctx.lineTo(button.rectangle.x + arrowSize, button.rectangle.y + button.rectangle.h);
			  ctx.closePath();
			}
			ctx.fill();
			ctx.stroke();
		  },
		  onClick: () => {
				if (dir == "left" && this.page > 0) this.page--;
				else if (dir == "right" && (this.page + 1) * this.max_for_page - 1 < this.array.length - 1) this.page++;

				this.close_tab.play();
			},
		};
		return button;
	}

	public isIndexInCurrentPage(index: number): boolean {
		const currPageStart = this.page * this.max_for_page;
        const currPageEnd = (this.page + 1) * this.max_for_page - 1;

        if (!(currPageStart <= index && index <= currPageEnd))
			return false;
		return true;
	}
	
	//TODO
	/*public create_itens_for_page(squareW: number, squareH: number, paddingX: number, paddingY: number, callback: (index: number, item: any, squareX: number, squareY: number) => ElementUI) {
		let page = 0;
	  
		this.array.forEach((item: any, index: number) => {
		  if ((index == 0 ? index + 1 : index) % this.max_for_page == 0) page++;
	  
		  const i = index - page * this.max_for_page;
	  
		  const squareX = 1 + (i % this.max_for_line) * (squareW + paddingX);
		  const squareY = 30 + paddingY + Math.floor(i / this.max_for_line) * (squareH + paddingY);
		  const elementUI = callback(index, item, squareX, squareY);
		  this.menu?.add(this.parent, elementUI);
		});
	}*/
}