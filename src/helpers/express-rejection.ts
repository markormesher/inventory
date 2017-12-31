import {NextFunction, Request, Response} from 'express';
import {StatusError} from './StatusError';

// set up reject methods on the response to use within routes

declare global {
	namespace Express {
		interface Response {
			rejectUnauthorised: (next: NextFunction, msg?: string) => void
			redirectUnauthorised: (redirect: string, msg?: string) => void
		}
	}
}

const makeMiddleware = () => {
	return <RequestHandler>(req: Request, res: Response, next: NextFunction) => {
		res.rejectUnauthorised = (next, msg) => {
			const error = new StatusError(msg || 'Unauthorised');
			error.status = 401;
			next(error);
		};

		res.redirectUnauthorised = (redirect, msg) => {
			res.flash('error', msg || 'Sorry, you can\'t do that.');
			res.redirect(redirect);
		};

		next();
	};
};

export = makeMiddleware
