const WebSocket = require('ws');
const { Sequelize, DataTypes } = require('sequelize');
const {generateKey, generateRandomKey } = require("../utils/generateKey")
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname, "../../../ghostloaderdb.sqlite")// Replace with the actual path to your SQLite database file
});

const Device = sequelize.define('MacroUsers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING
    },
    hwid: {
        type: DataTypes.STRING
    },
    hwidResetDate: {
        type: DataTypes.DATE
    },
    discordID: {
        type: DataTypes.STRING
    },
    invoiceID: {
        type: DataTypes.STRING
    },
    username: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'ghostmacro',
    timestamps: false
});


async function addUser(uuid, invoiceID) {
    await sequelize.sync()
    let dev = await Device.findOne({where: {invoiceID: invoiceID}})
    if (!dev) {
        const generatedKey = generateRandomKey(60); // Assuming generateKey is a valid function
        await Device.create({
            key: generatedKey,
            hwid: "none",
            discordID: uuid,
            hwidResetDate: new Date(),
            invoiceID: invoiceID
        });
        return generatedKey
    }
    return false;
}

async function getKeysForDiscordID(discordID) {
    try {
        const keys = await Device.findAll({
            where: {
                discordID: discordID
            }
        });

        if (keys.length === 0) {
            return `No keys found for the specified Discord ID.`;
        }

        let result = `Keys bound to Discord ID ${discordID}:\n`;
        keys.forEach(key => {
            const username = key.username || "You haven't ran it yet";
            const invoiceid = key.invoiceID;
            result += `- Key: ${key.key} <-> Username: \`${username}\` <-> Invoice ID: \`${invoiceid}\`\n`;
        });

        result += "\n\n DO NOT SHARE THIS KEY WITH ANYONE; YOU'LL NEED THIS TO USE THE MOD, IF OTHERS HAVE IT THEY CAN USE IT"

        return result;
    } catch (error) {
        throw new Error(`Error occurred: ${error}`);
    }
}


async function removeUser(invoiceID) {
    await sequelize.sync()
    const dev = await Device.findAll({ where: { invoiceID: invoiceID } });
    if (dev) {
        dev.forEach(( dev => {
            dev.destroy();

        }));
        return true;
    } else {
        return false;
    }
}

async function resetHwid(key, force) {
    await sequelize.sync();
    const dev = await Device.findOne({ where: { invoiceID: key } });

    if (dev) {
        const currentDate = new Date();
        const resetDate = new Date(dev.hwidResetDate);
        const timeDifference = currentDate - resetDate;
        const hoursPassed = Math.floor(timeDifference / (1000 * 60 * 60));

        if (hoursPassed >= 24 || force) {
            dev.hwid = "none";
            dev.hwidResetDate = new Date();
            await dev.save();
            return "Your hwid has been reset on the license " + `\`${key}\``;
        } else {
            const hoursLeft = 24 - hoursPassed;
            return `You need to wait ${hoursLeft} hours before resetting HWID on the license ` + `\`${key}\``;
        }
    } else {
        return "You are not whitelisted";
    }
}




module.exports = {addNewUser: addUser, removeUser, sequelize, Device, resetHwid, getKeysForDiscordID}
