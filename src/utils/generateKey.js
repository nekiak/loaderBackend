function generateRandomKey(length) {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let key = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		key += characters.charAt(randomIndex);
	}
	return key;
}

module.exports = { generateRandomKey };