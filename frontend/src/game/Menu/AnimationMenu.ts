import type { ElementUI } from "./Menu";

export enum Type_Animation {
	Start,
	End,	
}

export class AnimationMenu {

	type: Type_Animation;
	/*start_pos: number;
	end_pos: number;
	time_animation: number;
	menu: ElementUI;*/
	
	//cur_time: number;

	constructor ()
	{
		/*this.start_pos = start_pos;
		this.end_pos = end_pos;
		this.time_animation = time_animation;
		this.menu = menu;*/
		this.type = Type_Animation.Start;

		console.log(this)
	}

	public animation_horizontal_end(end_pos: number, menu: ElementUI) : boolean
	{
		if (end_pos > menu.rectangle.x)
		{
			menu.rectangle.x = menu.rectangle.x + 1 < end_pos ? menu.rectangle.x + 1 : end_pos;
			return false;
		}
		else
			return true;
			// this.menu.rectangle.x = this.menu.rectangle.x + this.menu.rectangle.x * 0.005 < this.end_pos ? this.menu.rectangle.x + this.menu.rectangle.x * 0.005 : this.end_pos;
	}

	public animation_horizontal_start(start_pos: number, menu: ElementUI) : boolean
	{
		if (start_pos < menu.rectangle.x)
		{
			menu.rectangle.x = menu.rectangle.x - 10 > start_pos ? menu.rectangle.x - 10 : start_pos;
			// this.menu.rectangle.x = this.menu.rectangle.x - this.menu.rectangle.x * 0.005 > this.start_pos ? this.menu.rectangle.x - this.menu.rectangle.x * 0.005 : this.start_pos;
			console.log(start_pos)
			return false;
		}
		else
			return true;
	}

	public animation(start_pos: number, end_pos: number, time_animation: number, menu: ElementUI): boolean
	{
		if (this.type == Type_Animation.End)
			return this.animation_horizontal_end(end_pos, menu);
		else
		 	return this.animation_horizontal_start(start_pos, menu);
	}
}
  