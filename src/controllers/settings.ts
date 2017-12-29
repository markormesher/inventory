import {Request, Response, Router} from 'express';

import AuthHelper = require('../helpers/auth');
import {User} from "../models/User";
import {sha256} from "../helpers/hashing";

const router = Router();

router.get('/account', AuthHelper.restrict(), (req: Request, res: Response) => {
	res.render('settings/account', {
		_: {
			title: 'Account Settings',
			activePage: 'settings/account',
		}
	});
});

router.post('/account', AuthHelper.restrict(), (req: Request, res: Response) => {
	const user = (<User> req.user);

	const formDisplayName = req.body.displayName;
	const formCurrentPassword = req.body.currentPassword;
	const formNewPassword1 = req.body.newPassword1;
	const formNewPassword2 = req.body.newPassword2;

	const updateValues = (<any> {});
	const updateSelector = (<any> {
		id: user.id
	});

	// block name changes if the user doesn't have the right permission
	if (user.hasPermission('settings.accounts.edit-display-name')) {
		updateValues['displayName'] = formDisplayName;
	}

	// check if we're changing passwords
	if (formCurrentPassword.length > 0 || formNewPassword1.length > 0 || formNewPassword2.length > 0) {
		if (formNewPassword1.length < 8) {
			res.flash('error', 'Your password needs to be at least 8 characters.');
			res.redirect('/settings/account');
			return;
		} else if (formNewPassword1 != formNewPassword2) {
			res.flash('error', 'You need to enter your new password twice.');
			res.redirect('/settings/account');
			return;
		} else {
			updateValues['password'] = sha256(formNewPassword1);
			updateSelector['password'] = sha256(formCurrentPassword);
		}
	}

	// commit the updates
	User.update(updateValues, {where: updateSelector}).then(() => {
		res.flash('success', 'Your changes have been saved.');
		res.redirect('/settings/account');
	}).error(err => {
		console.log(err);
		res.flash('error', 'Sorry, your changes could not be saved.');
		res.redirect('/settings/account');
	});
});

export = router;
