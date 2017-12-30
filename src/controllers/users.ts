import {NextFunction, Request, Response, Router} from 'express';
import {Op, ValidationError} from 'sequelize'
import {Promise} from 'bluebird';

import AuthHelper = require('../helpers/auth');
import {User} from '../models/User';
import {sha256} from '../helpers/hashing';

const router = Router();

router.get('/', AuthHelper.restrict(['users.view']), (req: Request, res: Response) => {
	res.render('users/index', {
		_: {
			title: 'Manage Users',
			activePage: 'users',
		}
	});
});

router.get('/list-data', AuthHelper.restrict(['users.view']), (req: Request, res: Response) => {
	const orderColumns = ['username', 'displayName'];

	const searchTerm = req.query['search']['value'];
	const queryOrder = req.query['order'].map((o: { column: string, dir: string }) => {
		return [orderColumns[parseInt(o.column)], o.dir]
	});

	Promise.all([
		User.count(),
		User.findAll({
			where: {
				[Op.or]: {
					username: {[Op.iLike]: `%${searchTerm}%`},
					displayName: {[Op.iLike]: `%${searchTerm}%`}
				}
			},
			order: queryOrder,
			offset: parseInt(req.query['start']),
			limit: parseInt(req.query['length'])
		})
	]).then(results => {
		const [countAllUsers, users] = results;
		res.json({
			recordsTotal: countAllUsers,
			recordsFiltered: users.length,
			data: users
		})
	}).catch(err => {
		console.log(err);
		res.status(500).end();
	});
});

router.get('/edit/:id?', AuthHelper.restrict(['users.view', 'users.edit']), (req: Request, res: Response, next: NextFunction) => {
	const userId = req.params.id;
	if (userId) {
		User.findOne({where: {id: userId}}).then(user => {
			if (!user) {
				res.flash('error', 'Sorry, that user can\'t be edited.');
				res.redirect('/users');
				return;
			}

			res.render('users/edit', {
				_: {
					title: 'Edit User',
					activePage: 'users',
				},
				editUser: user
			});
		}).catch(next);
	} else {
		res.render('users/edit', {
			_: {
				title: 'Create User',
				activePage: 'users',
			}
		});
	}
});

router.post('/edit/:id?', AuthHelper.restrict(['users.view', 'users.edit']), (req: Request, res: Response, next: NextFunction) => {
	const userId = req.params.id; // string or undefined

	const userToUpsert: any = {
		id: userId,
		username: req.body.username,
		displayName: req.body.displayName
	};
	const userToValidate = User.build(userToUpsert);
	const validationPromises = [userToValidate.validate(), userToValidate.validateUniqueUsername()];

	// add password validation/value if this is a new user
	if (req.body.newPassword1) {
		validationPromises.push(userToValidate.validateNewPassword(req.body.newPassword1, req.body.newPassword2));
		userToUpsert.password = sha256(req.body.newPassword1);
	}

	Promise.all(validationPromises).then(() => {
		User.upsert(userToUpsert).then(() => {
			res.flash('success', 'User saved.');
			res.redirect('/users');
		}).catch(next);
	}).catch((validationError: ValidationError) => {
		if (validationError.errors && validationError.errors.length > 0) {
			validationError.errors.forEach(error => res.flash('error', error.message));
		} else {
			res.flash('error', validationError.message);
		}
		res.redirect(`/users/edit/${userId || ''}`);
	}).catch(next);
});

router.get('/delete/:id', AuthHelper.restrict(['users.view', 'users.delete']), (req: Request, res: Response, next: NextFunction) => {
	User.findOne({where: {id: req.params.id}}).then(user => {
		if (!user || user.username === 'admin') {
			res.flash('error', 'Sorry, that user can\'t be deleted.');
			res.redirect('/users');
			return;
		}

		if (req.query.confirm === 'y') {
			user.destroy().then(() => {
				res.flash('success', 'User deleted.');
				res.redirect('/users');
			}).error(err => {
				next(err);
			});
		} else {
			res.render('users/delete', {
				_: {
					title: 'Delete User',
					activePage: 'users',
				},
				deleteUser: user
			});
		}
	}).catch(next);
});

export = router;
