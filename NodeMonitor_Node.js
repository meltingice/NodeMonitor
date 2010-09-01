/*
 * NodeMonitor
 * Copyright 2010 Ryan LeFevre - @meltingice
 *
 * Licensed under the New BSD License, more info in LICENSE file
 * included with this software.
 *
 * Source code is hosted at http://github.com/meltingice/NodeMonitor
 */

var	fs 		= require('fs'),
	net 	= require('net');

var MonitorNode = {
	config: require('./config/node_config'),
	plugins: {},
	server_conn: false,
	last_send: true
};

MonitorNode.start = function() {
	console.log("Starting NodeMonitor Node!");
	
	this.load_plugins();
	this.server_connect();
}

MonitorNode.load_plugins = function() {
	// Load plugins
	var plugin_count = 0;
	var pluginarr = fs.readdirSync('./plugins');
	pluginarr.forEach(function(plugin) {
		plugin = plugin.split('.')[0];
		MonitorNode.plugins[plugin] = require('./plugins/'+plugin);
		plugin_count++;
	});

	console.log(plugin_count + " plugins loaded.");
}

MonitorNode.server_connect = function() {
	this.server_conn = net.createConnection(this.config.server_port, this.config.server_addr);
	this.server_conn.setKeepAlive(false);
	this.server_conn.setNoDelay(true);
	
	this.server_conn.on('connect', function() {
		console.log("Connected to NodeMonitor Server at " + MonitorNode.config.server_addr + ":" + MonitorNode.config.server_port);
		MonitorNode.execute_plugins();
	});
	this.server_conn.on('error', function(exception) {
		console.log('Error: ' + exception.message);
		process.exit(1);
	});
}

MonitorNode.execute_plugins = function() {
	var interval = setInterval(function(){
		for(var plugin in MonitorNode.plugins) {
			MonitorNode.plugins[plugin].poll(function(plugin_name, data) {
				MonitorNode.send_data(plugin_name, data);
			});
		}
	}, 500);
}

MonitorNode.send_data = function(plugin, msg) {
	var data = JSON.stringify({'plugin':plugin, 'msg':msg, 'origin':this.config.node_name});
	
	/*
	 * I really hate doing this, but sometimes multiple pieces of data
	 * get clumped together into a single packet, so I needed a simple way to
	 * signal the beginning and end of each JSON object. This allows the server to
	 * easily separate each object when parsing the incoming packets. Suggestions
	 * for improvement are welcome.
	 */
	this.last_send = this.server_conn.write("//START//"+data+"//END//", 'utf8');
}

// Start the node!
MonitorNode.start();