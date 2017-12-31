import {User} from '../../models/User';

import Permissions = require('../../helpers/permissions');

const getActions = (rowUser: User) => {
	const actions: string[] = [];

	if (window.Inventory.user.hasPermission(Permissions.USERS.EDIT)) {
		actions.push(`<a href="/users/edit/${rowUser.id}">Edit</a>`);
	}

	if (window.Inventory.user.hasPermission(Permissions.USERS.DELETE) && rowUser.username !== 'admin') {
		actions.push(`<a href="/users/delete/${rowUser.id}">Delete</a>`);
	}

	if (actions.length === 0) {
		return '<span class="text-muted">None</span>';
	} else {
		return actions.join(' <span class="text-muted">&bull;</span> ');
	}
};

$(() => {
	$('table#users').DataTable({
		paging: true,
		lengthMenu: [
			[25, 50, 100],
			[25, 50, 100]
		],
		order: [[0, 'asc']],
		columnDefs: [
			{targets: [0, 1], orderable: true},
			{targets: [2], orderable: false}
		],
		serverSide: true,
		ajax: {
			url: '/users/list-data',
			type: 'get',
			dataSrc: (raw: { data: User[] }) => {
				const displayData: string[][] = [];
				raw.data.forEach(user => {
					displayData.push([user.username, user.displayName, getActions(user)])
				});
				return displayData;
			}
		}
	})

});
