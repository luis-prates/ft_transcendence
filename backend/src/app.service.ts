import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
	constructor(private prisma: PrismaService) {}
	getHello(): string {
		return 'Hello World!';
	}

	deleteDatabase(): any {
		return (this.prisma.cleanDb());
	}
}
