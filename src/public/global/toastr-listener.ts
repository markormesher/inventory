$(() => {
	const toastrMessages = window.Inventory.toastrMessages;
	for (let type in toastrMessages) {
		if (toastrMessages.hasOwnProperty(type)) {
			const messages = toastrMessages[type];
			messages.forEach((message: string) => toastr[type](message))
		}
	}
});
