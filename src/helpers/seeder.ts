import {User} from "../models/User";
import {sha256} from "./hashing";
import ConfigLoader = require('./config-loader');
import uuid = require('uuid');

const secrets = ConfigLoader.getSecrets();

const populateDatabase = () => {

	// admin user
	User.findOne({where: {username: 'admin'}}).then(user => {
		if (user) {
			console.log(`Admin user was created at ${user.createdAt}`)
		} else {
			console.log('Creating admin user...');
			User.create({
				id: uuid.v4(),
				displayName: 'System Admin',
				username: 'admin',
				password: sha256(secrets.adminPassword)
			}).then(() => {
				console.log('Created admin user');
			}).error(err => {
				console.log('Could not create admin user');
				console.log(err);
			});
		}
	}).error(err => {
		console.log('Could not check for admin user');
		console.log(err);
	});

};

export {populateDatabase}
