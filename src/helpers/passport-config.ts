import {PassportStatic as Passport} from 'passport';
import {Strategy as LocalPassportStrategy} from 'passport-local';

import UserManager = require('../managers/user-manager');

const init = (passport: Passport) => {
	passport.serializeUser((user: object, callback) => callback(null, JSON.stringify(user)));

	passport.deserializeUser((user: string, callback) => callback(null, JSON.parse(user)));

	passport.use(new LocalPassportStrategy({}, (username, password, callback) => {
		UserManager.getUserForAuth(username, password)
				.then(user => callback(null, user))
				.error(err => callback(err));
	}));
};

export {init};
