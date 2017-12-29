import {Request, Response, Router} from 'express';

import AuthHelper = require('../helpers/auth');

const router = Router();

router.get('/account', AuthHelper.restrict(), (req: Request, res: Response) => {
	res.render('settings/account', {
		_: {
			title: 'Account Settings',
			activePage: 'settings/account',
		}
	});
});

export = router;
