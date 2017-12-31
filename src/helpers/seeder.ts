import {User} from "../models/User";
import ConfigLoader = require('./config-loader');

const secrets = ConfigLoader.getSecrets();

const populateDatabase = () => {

	// admin user
	User.findOne({where: {username: 'admin'}}).then(user => {
		if (user) {
			console.log(`Admin user was created at ${user.createdAt}`)
		} else {
			const salt = User.generateSalt();
			User.create({
				displayName: 'System Admin',
				username: 'admin',
				salt: salt,
				password: User.generatePasswordHash(secrets.adminPassword, salt)
			}).then(() => {
				console.log('Created admin user');
			}).catch(err => {
				console.log('Could not create admin user');
				console.log(err);
			});
		}
	}).catch(err => {
		console.log('Could not check for admin user');
		console.log(err);
	});

};

export {populateDatabase}
