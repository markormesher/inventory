import {Request, Response, NextFunction, RequestHandler} from 'express';

export interface RestrictOptions {
	redirectTo?: string;
	redirectMsg?: string;
}

const loadUser: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;
	if (user) {
		user.clearSensitiveValues();
		res.locals.user = user;
	} else {
		res.locals.user = null;
	}
	next();
};

const restrict: (requiredPermissions?: string[], options?: RestrictOptions) => RequestHandler =
		(requiredPermissions = [], options = {}) => {
			return (req: Request, res: Response, next: NextFunction) => {
				const user = req.user;
				if (!user) {
					res.redirectUnauthorised('/auth/login', 'Sorry, you need to log in first.');
				} else {
					if (requiredPermissions.some(p => !user.hasPermission(p))) {
						if (options.redirectTo) {
							res.redirectUnauthorised(options.redirectTo, options.redirectMsg);
						} else {
							res.rejectUnauthorised(next);
						}
					} else {
						next();
					}
				}
			};
		};

export {loadUser, restrict};
