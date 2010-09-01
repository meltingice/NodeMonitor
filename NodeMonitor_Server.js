/*
 * NodeMonitor
 * Copyright 2010 Ryan LeFevre - @meltingice
 *
 * Licensed under the New BSD License, more info in LICENSE file
 * included with this software.
 *
 * Source code is hosted at http://github.com/meltingice/NodeMonitor
 */

var net = require('net');

var MonitorServer = {
	config: require('./config/server_config'),
	server: false
};

MonitorServer.start = function() {
	console.log('Starting NodeMonitor Server!');
	
	this.start_node_listener();
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

// Start the server!
MonitorServer.start();