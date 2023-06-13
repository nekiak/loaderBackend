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
			aliases: ['loader'],
			description: 'Updates the loader',
			preconditions: ['OwnerOnly']
		});
	}


	async messageRun(message, args) {
		try {
			let attachment = message.attachments.first();
			if (!attachment || attachment.name !== "loader.jar") {
				await message.reply("You have to include a loader.jar file")
			} else {
				await this.downloadJarFromURL(attachment.url, attachment.name)
				await message.reply("Jar uploaded successfully")
			}

		} catch (e) {
		}
	}




	async downloadJarFromURL(url, fileName) {
		if (fileName.endsWith('.jar')) {
			const destination = path.join("/var/www/loader.nekiak.com/html/", fileName);

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
