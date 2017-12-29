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
});
