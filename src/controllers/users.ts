import {Request, Response, Router} from 'express';

import AuthHelper = require('../helpers/auth');

const router = Router();

router.get('/', AuthHelper.restrict(['users.view']), (req: Request, res: Response) => {
	res.render('users/index', {
		_: {
			title: 'Manage Users',
			activePage: 'users',
		}
	});
});

router.get('/data', AuthHelper.restrict(['users.view']), (req: Request, res: Response) => {
	const start = parseInt(req.query['start']);
	const count = parseInt(req.query['length']);
	const order = req.query['order'][0]['dir'];
	const search = req.query['search']['value'];

	res.json({
		recordsTotal: 0,
		recordsFiltered: 0,
		data: []
	})
});

export = router;
