interface Window {
	Inventory: any;
}

$(() => {
	// extend user model
	if (window.Inventory.user) {
		window.Inventory.user.hasPermission = (permission: string) => {
			return window.Inventory.user.username === 'admin'
					|| window.Inventory.user.permissions.indexOf(permission) >= 0;
		};
	}

	// set up names on ID'd form inputs
	$('input').each((i, e) => {
		if (!$(e).attr('name')) {
			$(e).attr('name', e.id);
		}
	});
});
