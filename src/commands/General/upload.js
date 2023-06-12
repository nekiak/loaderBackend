const { Subcommand } = require('@sapphire/plugin-subcommands');
const { addNewUser, removeUser } = require('../../database/database');
const { getAllOrdersByUser } = require('../../api/api-garbo');
const { generateRandomKey } = require('../../utils/generateKey');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const AdmZip = require(	'adm-zip');

class UploadCommand extends Subcommand {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: ['upload'],
			description: 'Update the mod',
			preconditions: ['OwnerOnly']
		});
	}


	async messageRun(message, args) {
		try {
			const a = await args.pick('string');
			let attachment = message.attachments.first();
			if (!attachment) {
				await message.reply("You have to include a jar file (production.jar for production)")
			} else {
				this.saveChangelog(attachment.name, message.content.slice("!upload".length));
				await this.downloadJarFromURL(attachment.url, attachment.name)
				await message.reply("Jar uploaded successfully, changelog has been added inside the jar!")
			}

		} catch (e) {
			console.log(e)
			await message.reply("You need to specify a changelog!");
		}
	}


	saveChangelog(jarName, changelog) {
		const fileName = `${jarName}.txt`;
		const folderPath = path.join(__dirname, '../../../changelogs');
		const filePath = path.join(folderPath, fileName);

		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath, { recursive: true });
		}

		fs.writeFileSync(filePath, changelog);

	}

	async downloadJarFromURL(url, fileName) {
		if (fileName.endsWith('.jar')) {
			const destination = path.join(__dirname, '../../../jars/', fileName);

			const response = await axios({
				method: 'GET',
				url,
				responseType: 'stream',
			});

			const writer = fs.createWriteStream(destination);

			response.data.pipe(writer);

			return new Promise((resolve, reject) => {
				writer.on('finish', resolve);
				writer.on('error', reject);
			}).then(() => {
				console.log(`Downloaded ${fileName} to ${destination}`);
			});
		} else {
			console.log('The file is not a .jar file.');
		}
	}


}
module.exports = {
	UploadCommand
};
