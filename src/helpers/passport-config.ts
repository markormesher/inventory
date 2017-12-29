import {PassportStatic as Passport} from 'passport';
import {Strategy as LocalPassportStrategy} from 'passport-local';

import {User} from "../models/User";
import {sha256} from "./hashing";

const init = (passport: Passport) => {
	passport.serializeUser((user: User, callback) => callback(null, user.id));

	passport.deserializeUser((userId: string, callback) => {
		User.findOne({where: {id: userId}}).then(user => {
			callback(null, user)
		}).error(err => {
			callback(err)
		});
	});

	passport.use(new LocalPassportStrategy({}, (username, password, callback) => {
		User.findOne({
			where: {
				username: username,
				password: sha256(password)
			}
		}).then(user => {
			callback(null, user)
		}).error(err => {
			callback(err)
		});
	}));
};

export {init};
