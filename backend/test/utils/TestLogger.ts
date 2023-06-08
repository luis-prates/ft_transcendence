import { Logger } from '@nestjs/common';

export class TestLogger extends Logger {
	private logs = [];

	log(message: string) {
		super.log(message);
		this.logs.push(message);
	}

	getLogs() {
		return this.logs;
	}
}
