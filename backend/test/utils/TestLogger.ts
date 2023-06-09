import { Logger } from '@nestjs/common';

export class TestLogger extends Logger {
	private logs : any[] = [];

	log(message: string) {
		super.log(message);
		this.logs.push(message);
	}

	getLogs() {
		return this.logs;
	}
}
