import { Controller, Delete } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('prisma')
export class PrismaController {
	constructor(private prismaService: PrismaService) {}
	
	@Delete('database')
	deleteDatabase() {
		return this.prismaService.cleanDb();
	}
}
