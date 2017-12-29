import {User} from '../models/User';
import Promise = require('bluebird');
import {sha256} from "../helpers/hashing";

const getUserForAuth = (username: string, password: string): Promise<User> => {
	return User.findOne({
		where: {
			username: username,
			password: sha256(password)
		}
	});
};

export {
	getUserForAuth
};
