const { sequelize, Device } = require('../database/database');
const fs = require("fs");
const WebSocket = require("ws");
const path = require('path');
const https = require("https");

const activeConnections = {};
// lets assume that your priv key is private.key, your cert is certificate.pem and your chain is fullchain.pem
const cert_dir = "../../cert/myLoaderServer/"
const shouldUseSSL = true;
const port = 65212

async function handleWebSocketConnection(ws, req) {
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

			// Send the binary data as a WebSocket message
			ws.send(data.toString("base64"));
		}
	);

	// Handle disconnection event
	ws.on("close", () => {
		console.log("left");
		delete activeConnections[keyHeader];
	});
}


async function start() {

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
