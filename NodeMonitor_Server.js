/*
 * NodeMonitor
 * Copyright 2010 Ryan LeFevre - @meltingice
 *
 * Licensed under the New BSD License, more info in LICENSE file
 * included with this software.
 *
 * Source code is hosted at http://github.com/meltingice/NodeMonitor
 */

var net 	= require('net'),
	http	= require('http'),
	io		= require('./lib/socket.io'),
	fs		= require('fs'),
	logger	= require('./lib/logger');

var MonitorServer = {
	config: require('./config/server_config'),
	server: false,
	httpserver: null,
	websocket: null
};

MonitorServer.start = function() {	
	logger.set_dest('server');
	logger.enable_console(true);
	logger.write('Starting NodeMonitor Server!');	
	
	this.start_node_listener();
	this.start_web_server();
}

MonitorServer.start_node_listener = function() {
	this.server = net.createServer(function(stream) {
		stream.setEncoding('utf8');
		stream.on('connect', function(t) {
			logger.write("Node connected from " + stream.remoteAddress);
			logger.write("Now monitoring " + MonitorServer.server.connections +" node(s)");
		});
		stream.on('data', function(data) {
			var reqs = data.split(/\/\/START\/\/(.*?)\/\/END\/\//);
			if(reqs.length > 0) {
				reqs.forEach(function(req) {
					if(req == ""){ return true; }
					
					if(MonitorServer.websocket) {
						MonitorServer.websocket.broadcast(req);
					}
				});
			}
		});
		stream.on('end', function() {
			logger.write("Node disconnecting...");
		});
	});
	
	this.server.listen(this.config.node_listen_port, this.config.node_listen_addr);
	logger.write("NodeMonitor Server now listening on " + this.config.node_listen_addr + ":" + this.config.node_listen_port);
}

MonitorServer.start_web_server = function() {
	this.httpserver = http.createServer(function(req, res) {
		res.writeHead(200, {});
		
		var url;
		if(req.url == '/') { url = '/index.html'; }
		else {
			// security measure
			url = req.url.replace('..', '');
		}
		
		logger.write(req.socket.remoteAddress + ' - ' + req.method + ' ' + url);
		fs.readFile('./html' + url, function(err, data) {
			if(err) {
				res.close();
				return true;
			}
			
			if(req.url == '/js/nodemonitor.js') {
				data = new String(data).replace(/(\{\*NODEMONITOR_SERVER_ADDR\*\})/g, "'"+MonitorServer.config.http_listen_addr+"'");
			}
			
			res.write(data);
			res.close();
		});
	});
	
	this.httpserver.listen(this.config.http_listen_port);
	this.websocket = io.listen(this.httpserver);	
}

// Start the server!
MonitorServer.start();