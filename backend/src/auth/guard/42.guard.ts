import { ExecutionContext, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class FortyTwoGuard extends AuthGuard('42') {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			const activate: boolean = (await super.canActivate(context)) as boolean;
			const request: Request = context.switchToHttp().getRequest();
			await super.logIn(request);
			return activate;
		} catch (error) {
			if (error instanceof UnauthorizedException) {
				throw new UnauthorizedException(error.message);
			} else if (error instanceof InternalServerErrorException) {
				throw new InternalServerErrorException(error.message);
			}
			throw error;
		}
	}
}
