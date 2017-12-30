import {Request, Response, Router} from 'express';
import {Op} from 'sequelize'
import {Promise} from 'bluebird';

import AuthHelper = require('../helpers/auth');
import {User} from '../models/User';

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
	const columns = ['username', 'displayName'];

	const start = parseInt(req.query['start']);
	const count = parseInt(req.query['length']);
	const order = req.query['order'];
	const search = req.query['search']['value'];

	const queryOrder = order.map((o: { column: string, dir: string }) => [columns[parseInt(o.column)], o.dir]);

	Promise.all([
		User.findAll({
			where: {
				[Op.or]: {
					username: {[Op.iLike]: `%${search}%`},
					displayName: {[Op.iLike]: `%${search}%`}
				}
			},
			order: queryOrder,
			offset: start,
			limit: count
		}),
		User.count()
	]).then(results => {
		const [users, countAllUsers] = results;
		res.json({
			recordsTotal: countAllUsers,
			recordsFiltered: users.length,
			data: users
		})
	}).error(err => {
		console.log(err);
		res.status(500).end();
	});
});

export = router;
