const http = require('http');
const https = require('https');
const path = require('path');
const { initializeIO } = require('./socket-io');
const config = require('config');
const fs = require('fs');
const express = require('express');
const loaders = require('./loaders');
const debug = require('debug')('dejavu-server:server');
const { normalizePort } = require('./utils/utils');

const createHttpsServer = app => {
	const port = normalizePort(config.get('securePort') || '3443');
	app.set('securePort', port);
	const options = {
		key: fs.readFileSync(`${__dirname}/ssl/private.key`),
        cert: fs.readFileSync(`${__dirname}/ssl/certificate.pem`)
	};
	const server = https.createServer(options, app);
	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);
	return server;
	function onError(error) {
		if (error.syscall !== 'listen') {
		  throw error;
		}
	  
		var bind = typeof port === 'string'
		  ? 'Pipe ' + port
		  : 'Port ' + port;
	  
		// handle specific listen errors with friendly messages
		switch (error.code) {
		  case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		  case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		  default:
			throw error;
		}
	}
	
	function onListening() {
		var addr = server.address();
		var bind = typeof addr === 'string'
		  ? 'pipe ' + addr
		  : 'port ' + addr.port;
		debug('Listening on ' + bind);
	}
};

const createHttpServer = app => {
	const port = normalizePort(config.get('port') || '3000');
	app.set('port', port);
	const server = http.createServer(app);
	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);
	return server;
	function onError(error) {
		if (error.syscall !== 'listen') {
		  throw error;
		}
	  
		var bind = typeof port === 'string'
		  ? 'Pipe ' + port
		  : 'Port ' + port;
	  
		// handle specific listen errors with friendly messages
		switch (error.code) {
		  case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		  case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		  default:
			throw error;
		}
	}
	
	function onListening() {
		var addr = server.address();
		var bind = typeof addr === 'string'
		  ? 'pipe ' + addr
		  : 'port ' + addr.port;
		debug('Listening on ' + bind);
	}
};

const startServer = async () => {
	let app = express();
	try {
		app = await loaders({ expressApp: app });
		createHttpServer(app);
		const httpsServer = createHttpsServer(app);
		initializeIO(httpsServer);
	}
	catch (err) {
		debug('Internal server error\n', err);
	}
}

startServer();