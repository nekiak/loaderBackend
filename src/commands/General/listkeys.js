const { Subcommand } = require('@sapphire/plugin-subcommands');
const { getKeysForDiscordID } = require('../../database/database');
const { owners } = require('../../config.json');


class ListKeys extends Subcommand {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: ['listkeys'],
			description: 'List all your keys',

		});
	}

	async messageRun(message, args, context) {
		if (doOwnerCheck(message.author.id)) {
			try {
				args = await args.pick("user")
				await message.author.send(await getKeysForDiscordID(args.id))
			} catch (e) {
				await message.author.send(await getKeysForDiscordID(message.author.id))
			}
		} else {
			try {
				await message.author.send(await getKeysForDiscordID(message.author.id))
			} catch (e) {
				await message.reply("You need to allow the bot to DM you!")
			}
		}

	}

}

function doOwnerCheck(userId) {
	return owners.includes(userId);
}

module.exports = {
	ListKeys
};
