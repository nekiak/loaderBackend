const { Subcommand } = require('@sapphire/plugin-subcommands');
const { addNewUser, removeUser } = require('../../database/database');
const { getAllOrdersByUser } = require('../../api/api-garbo');
const { generateRandomKey } = require('../../utils/generateKey');

class UserCommand extends Subcommand {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: ['whitelist'],
			description: 'Give access to the ghost macro',
			preconditions: ['OwnerOnly'],
			subcommands: [
				{
					name: 'add',
					messageRun: 'messageAdd',
					default: true
				},
				{
					name: 'remove',
					messageRun: 'messageRemove'
				}]
		});
	}


	async messageAdd(message, args) {
		try {


			const a = await args.pick('user');
			let orders = (await getAllOrdersByUser(a.id))
			if (!orders) {
				if (await addNewUser(a.id, "" + (generateRandomKey(15)))) {
					await message.reply(a.username + " has been whitelisted successfully for the Ghost Macro")
				} else {
					await message.reply(a.username + " is already whitelisted!")
				}
			} else {
				await message.reply(`<@${a.id}>, please run the \`redeem\` command!!`)
			}
		} catch (e) {
			await message.reply("You need to specify a user")
		}
	}


	async messageRemove(message, args) {
		try {
			const invoiceid = await args.pick('string');

			if (await removeUser(invoiceid)) {
				await message.reply(invoiceid + " has been successfully removed from the whitelist!")
			} else {
				await message.reply(invoiceid + " is not in the whitelist!")

			}
		} catch (e) {

			await message.reply("You need to specify an invoice id")
		}
	}
}
module.exports = {
	UserCommand
};
