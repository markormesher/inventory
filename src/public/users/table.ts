import {User} from '../../models/User';

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
			url: '/users/data',
			type: 'get',
			dataSrc: (raw: { data: User[] }) => {
				const displayData: string[][] = [];
				raw.data.forEach(user => {
					displayData.push([user.username, user.displayName, ''])
				});
				return displayData;
			}
		}
	})

});
