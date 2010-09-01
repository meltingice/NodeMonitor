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
	fs		= require('fs');

var MonitorServer = {
	config: require('./config/server_config'),
	server: false,
	httpserver: null,
	websocket: null
};

MonitorServer.start = function() {
	console.log('Starting NodeMonitor Server!');
	
	this.start_node_listener();
	this.start_web_server();
}

MonitorServer.start_node_listener = function() {
	this.server = net.createServer(function(stream) {
		stream.setEncoding('utf8');
		stream.on('connect', function(t) {
			console.log("Node connected!");
		});
		stream.on('data', function(data) {
			var reqs = data.split(/\/\/START\/\/(.*?)\/\/END\/\//);
			if(reqs.length > 0) {
				reqs.forEach(function(req) {
					if(req == ""){ return true; }
					
					console.log(JSON.parse(req));
				});
			}
		});
		stream.on('end', function() {
			console.log("Node disconnecting...");
		});
	});
	
	this.server.listen(this.config.node_listen_port, this.config.node_listen_addr);
	console.log("NodeMonitor Server now listening on " + this.config.node_listen_addr + ":" + this.config.node_listen_port);
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
		
		console.log(req.socket.remoteAddress + ' - ' + req.method + ' ' + url);
		fs.readFile('./html' + url, function(err, data) {
			if(err) {
				res.close();
				return true;
			}
			
			res.write(data);
			res.close();
		});
	});
	
	this.httpserver.listen(this.config.http_listen_port);
	
	this.websocket = io.listen(this.httpserver);
	this.websocket.on('connection', function(client) {
		console.log("Web client connected!");
		console.log(client);
	});
}

// Start the server!
MonitorServer.start();