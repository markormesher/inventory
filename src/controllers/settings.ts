import {NextFunction, Request, Response, Router} from 'express';
import {ValidationError} from 'sequelize';
import {Promise} from 'bluebird';

import AuthHelper = require('../helpers/auth');
import {User} from '../models/User';
import Permissions = require('../helpers/permissions');

const router = Router();

router.get('/account', AuthHelper.restrict(), (req: Request, res: Response) => {
	res.render('settings/account', {
		_: {
			pageTitle: 'Account Settings',
			activePage: 'settings/account',
		}
	});
});

router.post('/account', AuthHelper.restrict(), (req: Request, res: Response, next: NextFunction) => {
	const user = (<User> req.user);

	const userToUpdate: any = {};
	const updateSelector: any = {id: user.id};

	// block display name changes if the user doesn't have the right permission
	if (user.hasPermission(Permissions.SETTINGS.ACCOUNT.EDIT_DISPLAY_NAME)) {
		userToUpdate.displayName = req.body.displayName;
	} else {
		userToUpdate.displayName = user.displayName;
	}

	const userToValidate = User.build(userToUpdate);
	const validationPromises = [userToValidate.validate({skip: ['username']})];

	// add password validation/value if is it being changed
	if (req.body.currentPassword.length || req.body.newPassword1.length || req.body.newPassword2.length) {
		validationPromises.push(userToValidate.validateNewPassword(req.body.newPassword1, req.body.newPassword2));
		const newSalt = User.generateSalt();
		userToUpdate.salt = newSalt;
		userToUpdate.password = User.generatePasswordHash(req.body.newPassword1, newSalt);
		updateSelector.password = User.generatePasswordHash(req.body.currentPassword, user.salt);
	}

	Promise.all(validationPromises).then(() => {
		User.update(userToUpdate, {where: updateSelector}).then(changes => {
			if (changes[0] === 1) {
				res.flash('success', 'Changes saved.');
				res.redirect('/settings/account');
			} else {
				res.flash('error', 'Sorry, your changes couldn\'t be saved.');
				res.redirect('/settings/account');
			}
		}).catch(next);
	}).catch((validationError: ValidationError) => {
		if (validationError.errors && validationError.errors.length > 0) {
			validationError.errors.forEach(error => res.flash('error', error.message));
		} else {
			res.flash('error', validationError.message);
		}
		res.redirect('/settings/account');
	}).catch(next);
});

export = router;
