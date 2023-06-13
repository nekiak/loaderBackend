// pass <MERCHANT_NAME> only if you need to be authenticated as an additional store
const sellix = require("@sellix/node-sdk")("WvRcVL08Ysqjndpn5KeTeJ56X8wPpEELYtBT1AiEwoRAcau9JJkb2qfD2p3DWXuH")


async function getAllOrdersByUser(uniqid) {
	try {

		const order = await sellix.orders.get(uniqid);
		return order["custom_fields"]["discord_id"]

	} catch (e) {

		console.log(e);

	}
};


async function findOrdersByDiscordId(discordId) {
	const parsedData = await sellix.orders.list();
	const desiredStatus = "COMPLETED";
	const uniqids = [];

	parsedData.forEach((item) => {
		if (item["custom_fields"]["discord_id"] === discordId && item["status"] === desiredStatus) {
			uniqids.push(item["uniqid"]);
		}
	});
	console.log(uniqids === true	)
	return uniqids;
}



module.exports = {getAllOrdersByUser, findOrdersByDiscordId}