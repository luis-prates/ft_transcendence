import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(UnauthorizedException)
export class OAuthExceptionFilter implements ExceptionFilter {
	catch(exception: UnauthorizedException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		const exceptionResponse = exception.getResponse();
		if (request.query.error) {
			const errorDescription =
				typeof request.query.error_description === 'string'
					? request.query.error_description
					: 'An unknown error occurred';
			response.redirect(`${process.env.FRONTEND_REDIRECT_URL}/?error=${encodeURIComponent(errorDescription)}`);
		} else if (
			typeof exceptionResponse === 'object' &&
			exceptionResponse !== null &&
			'message' in exceptionResponse
		) {
			if (typeof exceptionResponse.message === 'string') {
				response.redirect(
					`${process.env.FRONTEND_REDIRECT_URL}/?error=${encodeURIComponent(exceptionResponse.message)}`,
				);
			}
		} else {
			response.status(status).json({
				statusCode: status,
				timestamp: new Date().toISOString(),
				path: request.url,
			});
		}
	}
}
