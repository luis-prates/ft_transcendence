import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
	// console.log('aqui');
	// console.log(ctx.switchToHttp().getRequest().user);
	const request = ctx.switchToHttp().getRequest();
	if (data) {
		return request.user[data];
	}
	delete request.user.hash;
	delete request.user.twoFASecret;
	return request.user;
});
