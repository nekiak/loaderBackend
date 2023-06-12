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
        exec('bash ~/loaderBackend/restart.sh', (error, stdout, stderr) => {
            if (error) {
                console.error(`Deployment error: ${error}`);
                return;
            }

            console.log('Git pull and app restart completed successfully.');
        });
    }



}
module.exports = {
    UpdateCommand
};
