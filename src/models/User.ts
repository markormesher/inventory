import Sequelize = require('sequelize');
import {Table, Column, Model, DataType} from 'sequelize-typescript';

@Table
export class User extends Model<User> {

	@Column({
		primaryKey: true,
		type: Sequelize.UUID,
		defaultValue: Sequelize.UUIDV4
	})
	id: string;

	@Column
	displayName: string;

	@Column
	username: string;

	@Column
	get password(): string {
		return undefined;
	}

	@Column({
		type: DataType.ARRAY(DataType.STRING),
		defaultValue: []
	})
	permissions: string[];

	hasPermission(permission: string): boolean {
		return this.username === 'admin' || this.permissions.indexOf(permission) >= 0;
	}
}
