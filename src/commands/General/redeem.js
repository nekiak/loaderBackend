const { Subcommand } = require('@sapphire/plugin-subcommands');
const { addNewUser, removeUser, resetHwid, getKeysForDiscordID } = require('../../database/database');
const { UserPrecondition } = require('../../preconditions/OwnerOnly');
const { owners } = require('../../config.json');
const { getUserByOrder, 		getAllOrdersByUser, findOrdersByDiscordId } = require('../../api/api-garbo');
const { client } = require('../../index');

class Redeem extends Subcommand {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: ['redeem'],
			description: 'Redeem the ghost macro with your invoice id!',
		});
	}

	async messageRun(message, args, context) {

		try {

			let orders = await findOrdersByDiscordId(message.author.id);
			if (!orders) {
				await message.reply("You haven't bought the mod.")
				return;
			} else {
				for (let order of orders) {
					await addNewUser(message.author.id, order)
				}
				try {
					await message.author.send(await getKeysForDiscordID(message.author.id))
				} catch (e) {
					await message.reply("You need to allow the bot to DM you!")
				}
			}

			let guild =(await client.guilds.fetch("997464259170680923"));
			let role = (await guild.roles.fetch("1115752274174672956"));
			await (await guild.members.fetch(message.author.id)).roles.add(role)

		} catch (e) {
		}
	}

}


module.exports = {
	Redeem
};
