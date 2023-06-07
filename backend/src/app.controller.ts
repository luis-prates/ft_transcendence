import { Controller, Get, Param, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('v2/hello')
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('v2/hello/sd')
	getdfdHello(): string {
		return this.appService.getHello();
	}

	@Post('v2/hello/sd/dsd')
	d(as: any): string {
		return this.appService.getHello();
	}

	@Get('v2/image/:imageName')
	getImage(
		@Param('imageName') imageName: string,
		@Res() res: Response,
	): void {
		const imagePath = path.join(
			__dirname,
			'./',
			'public',
			'images',
			imageName,
		);
		const imageStream = fs.createReadStream(imagePath);

		imageStream.pipe(res);
	}
}
