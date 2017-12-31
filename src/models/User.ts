import Sequelize = require('sequelize');
import {Op, ValidationError} from 'sequelize';
import Bluebird = require('bluebird');
import uuid = require('uuid');
import {Column, DataType, IsUUID, Length, Model, Table} from "sequelize-typescript";

import {sha256} from '../helpers/hashing';

@Table
export class User extends Model<User> {

	static generateSalt() {
		return sha256(uuid.v4());
	}

	static generatePasswordHash(plaintextPassword: string, salt: string) {
		return sha256(plaintextPassword + salt);
	}

	@IsUUID(4)
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: Sequelize.UUIDV4
	})
	id: string;

	@Length({min: 1, msg: 'The username must be at least 1 character.'})
	@Column
	username: string;

	@Length({min: 1, msg: 'The display name must be at least 1 character.'})
	@Column
	displayName: string;

	@Column
	password: string;

	@Column
	salt: string;

	@Column({
		type: DataType.ARRAY(DataType.STRING),
		defaultValue: []
	})
	permissions: string[];

	hasPermission(permission: string): boolean {
		return this.username === 'admin' || this.permissions.indexOf(permission) >= 0;
	}

	validateUniqueUsername(): Bluebird<undefined> {
		return new Bluebird<undefined>((resolve, reject) => {
			User.findOne({
				where: {
					username: this.username,
					id: {
						[Op.not]: this.id
					}
				}
			}).then(user => {
				if (user) {
					reject(new ValidationError('That username is already in use.'));
				} else {
					resolve(null);
				}
			}).catch(reject);
		});
	}

	validateNewPassword(password1: string, password2: string): Bluebird<undefined> {
		return new Bluebird<undefined>((resolve, reject) => {
			if (password1.length < 8) {
				reject(new ValidationError('The password must be at least 8 characters.'));
			} else if (password1 != password2) {
				reject(new ValidationError('The passwords entered do not match.'));
			} else {
				resolve(undefined);
			}
		});
	}
}
