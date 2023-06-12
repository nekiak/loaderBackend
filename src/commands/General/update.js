const { Subcommand } = require('@sapphire/plugin-subcommands');
const { exec } = require('child_process');

class UpdateCommand extends Subcommand {
    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['update'],
            description: 'Update the mod',
            preconditions: ['OwnerOnly']
        });
    }


    async messageRun(message, args) {
        exec('git pull', (error, stdout, stderr) => {
            if (error) {
                message.reply(`Git pull error: ${error}`);
                return;
            }

            // Restart Node.js app using PM2
            exec('pm2 restart all', (error, stdout, stderr) => {
                if (error) {
                    message.reply(`App restart error: ${error}`);
                    return;
                }

                message.reply('Git pull and app restart completed successfully.');
            });
        });
    }



}
module.exports = {
    UpdateCommand
};
