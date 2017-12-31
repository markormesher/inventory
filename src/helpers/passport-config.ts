import {PassportStatic as Passport} from 'passport';
import {Strategy as LocalPassportStrategy} from 'passport-local';

import {User} from '../models/User';

const init = (passport: Passport) => {
	passport.serializeUser((user: User, callback) => callback(null, user.id));

	passport.deserializeUser((userId: string, callback) => {
		User.findOne({where: {id: userId}}).then(user => {
			callback(null, user)
		}).catch(callback);
	});

	passport.use(new LocalPassportStrategy({}, (username, password, callback) => {
		User.findOne({where: {username: username}}).then(user => {
			if (user && user.password == User.generatePasswordHash(password, user.salt)) {
				callback(null, user);
			} else {
				callback(null, null);
			}
		}).catch(callback);
	}));
};

export {init};
