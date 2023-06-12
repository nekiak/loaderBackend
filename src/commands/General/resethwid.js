const { Subcommand } = require('@sapphire/plugin-subcommands');
const { addNewUser, removeUser, resetHwid, Device } = require('../../database/database');
const { UserPrecondition } = require('../../preconditions/OwnerOnly');
const { owners } = require('../../config.json');
const { getAllOrdersByUser } = require('../../api/api-garbo');

class ResetHwid extends Subcommand {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: ['resethwid'],
			description: 'Give access to the ghost macro',
			preconditions: ['OwnerOnly'],
			subcommands: [
				{
					name: "",
					messageRun: "default",
					default: true
				},
				{
					name: "all",
					messageRun: "all"
				},
				{
					name: 'force',
					messageRun: 'force'
				}]
		});
	}

	async default(message, args) {
		try {
			let invoice = await args.pick("string")
			if (await getAllOrdersByUser(invoice) || await Device.findOne({where: {invoiceID: invoice}})) {
				await message.reply(await resetHwid(invoice, false))
			} else {
				await message.reply("You don't own any licenses")
			}
		} catch (e) {
			await message.reply("You need to specify an invoice id")
		}
	}



	async force(message, args) {
		try {
			let a = await args.pick("string")
			if (doOwnerCheck(message.author.id)) {
				await message.reply(await resetHwid(a, true))
			} else {
				await message.reply("You don't have perms")
			}
		}catch (e) {
				return await message.reply("You need to specify an invoice id")
			}
	}
}

function doOwnerCheck(userId) {
	return owners.includes(userId);
}
module.exports = {
	ResetHwid
};
