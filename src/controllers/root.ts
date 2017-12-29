import {Request, Response, Router} from 'express';

import AuthHelper = require('../helpers/auth');

const router = Router();

router.get('/', AuthHelper.restrict(), (req: Request, res: Response) => {
	res.render('root/index', {
		noTitle: true
	});
});

export = router;
