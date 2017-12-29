import {Request, Response, NextFunction, RequestHandler} from 'express';

const loadUser: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;
	res.locals.user = user || null;
	next();
};

const restrict: (requiredPermissions?: string[]) => RequestHandler = (requiredPermissions: string[] = []) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		if (!user) {
			res.flash('error', 'Sorry, you need to log in first.');
			res.redirect('/auth/login');
			return;
		}

		const userPermissions = user.permissions || [];
		const hasAllPermissions = requiredPermissions.every((p) => userPermissions.indexOf(p) >= 0);

		if (hasAllPermissions) {
			next();
		} else {
			res.flash('error', 'Sorry, you can\'t do that.');
			res.status(403).end();
		}
	};
};

export {loadUser, restrict};
