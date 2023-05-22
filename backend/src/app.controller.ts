import { Controller, Delete, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Delete('database')
	deleteDatabase(): string {
		return (this.appService.deleteDatabase());
	}
}
