import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	UnauthorizedException,
	InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(UnauthorizedException, InternalServerErrorException)
export class OAuthExceptionFilter implements ExceptionFilter {
	catch(exception: UnauthorizedException | InternalServerErrorException, host: ArgumentsHost) {
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
		} else if (status && status === 500) {
			const errorDescription = 'An unknown error occurred. Check your 42 Client ID and Secret';
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
			const errorDescription = 'An unknown error occurred';
			response.redirect(`${process.env.FRONTEND_REDIRECT_URL}/?error=${encodeURIComponent(errorDescription)}`);
		}
	}
}
