const { sequelize, Device } = require('../database/database');
const fs = require("fs");
const WebSocket = require("ws");
const path = require('path');
const https = require("https");
const crypto = require('crypto');

const activeConnections = {};
// lets assume that your priv key is private.key, your cert is certificate.pem and your chain is fullchain.pem
const cert_dir = "../../cert/myLoaderServer/"
const shouldUseSSL = true;
const port = 65212

async function handleWebSocketConnection(ws, req) {
	ws.alive = true;
	const headers = req.headers;
	const keyHeader = headers["key"];
	const usernameHeader = headers["username"];
	let jarHeader = headers["jarname"]

	console.log(headers);
	await sequelize.sync();
	const dev = await Device.findOne({ where: { key: keyHeader } });

	if (!keyHeader || !headers["hwid"]) {
		ws.close(3421, "Key and/or hwid header missing");
		return;
	}

	if (!dev) {
		ws.close(3423, "Invalid key");
		return;
	}



	if (dev.hwid !== "none" && dev.hwid !== headers["hwid"]) {
		ws.close(3424, "Invalid key or hwid");
		return;
	}



	if (activeConnections[keyHeader]) {
		// Close the additional connection with the same key header
		ws.close(3422, "New connection established");
		return;
	}

	// Add the connection to the activeConnections dictionary
	activeConnections[keyHeader] = ws;

	dev.hwid = headers["hwid"];
	dev.username = usernameHeader;
	ws.keyheader = keyHeader;

	await dev.save();

	if (!jarHeader) {
		jarHeader = "production.jar"
	}
	fs.readFile(
	path.join(__dirname, '../../jars/', jarHeader), (err, data) => {
			if (err) {
				console.error("Failed to read JAR file:", err);
				ws.close(3069, "Wtf are you doing idiiot")
				return;
			}

			const key = '#!ILoveOnePiece!'; // 16-byte key
			ws.send(encryptAES_ECB_PKCS7(key, data));
		}
	);

	// Handle disconnection event


	const interval = setInterval(function ping() {
		ws.clients.forEach(function each(ws) {
			if (ws.isAlive === false) {
				delete activeConnections[ws.keyheader];
				ws.terminate();
			}

			ws.isAlive = false;
			ws.ping();
		});
	}, 5000);

	ws.on("pong", heartbeat);
	function heartbeat() {
		this.isAlive = true;
	}

	ws.on("close", () => {
		console.log("left");
		clearInterval(interval)
		delete activeConnections[keyHeader];
	});



	// Store the timeout ID for later reference
	activeConnections[keyHeader].timeoutId = pingInterval;
}


function encryptAES_ECB_PKCS7(key, plaintext) {
	const cipher = crypto.createCipheriv('aes-128-ecb', key, Buffer.alloc(0));
	let ciphertext = cipher.update(plaintext);
	ciphertext = Buffer.concat([ciphertext, cipher.final()]);
	return ciphertext.toString("base64");
}

async function start() {
	console.log("Starting")
	let server;
	if (shouldUseSSL) {
		const privateKey = fs.readFileSync(path.join(cert_dir + "private.key"));
		const certificate = fs.readFileSync(path.join(cert_dir + "certificate.pem"));
		const fullchain = fs.readFileSync(path.join(cert_dir + "fullchain.pem"));
		let httpsServer = https.createServer({
			key: privateKey,
			cert: certificate,
			ca: fullchain,
		});
		server = new WebSocket.Server({ server:httpsServer, path: "/ghostloader" });
		httpsServer.listen(port, () => {
			console.log(`WebSocket server is running on port ${port} (HTTPS)`);
		});

	} else {
		server = new WebSocket.Server({ port: port, path: "/ghostloader" });
	}

	server.on('connection', (socket, req) => {
		console.log(req.headers.key + " just connected")
		handleWebSocketConnection(socket, req);
	});
}

start()

module.exports = { start };
