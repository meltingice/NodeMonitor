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
	net 	= require('net'),
	logger	= require('./lib/logger');

var MonitorNode = {
	config: require('./config/node_config'),
	plugins: {},
	server_conn: false,
	last_send: true
};

MonitorNode.start = function() {	
	logger.set_dest('node');
	logger.enable_console(true);
	logger.write("Starting NodeMonitor Node!");
	
	this.load_plugins();
	this.server_connect();
}

MonitorNode.load_plugins = function() {
	// Load plugins
	var plugin_count = 0;
	var pluginarr = fs.readdirSync('./plugins/enabled');
	pluginarr.forEach(function(plugin) {
		plugin = plugin.split('.')[0];
		MonitorNode.plugins[plugin] = require('./plugins/enabled/'+plugin);
		if(MonitorNode.config.plugin_options[plugin]) {
			MonitorNode.plugins[plugin].set_options(MonitorNode.config.plugin_options[plugin]);
		}
		
		plugin_count++;
	});

	logger.write(plugin_count + " plugins loaded.");
}

MonitorNode.server_connect = function() {
	this.server_conn = net.createConnection(this.config.server_port, this.config.server_addr);
	
	this.server_conn.on('connect', function() {
		logger.write("Connected to NodeMonitor Server at " + MonitorNode.config.server_addr + ":" + MonitorNode.config.server_port);
		MonitorNode.server_conn.setKeepAlive(true);
		MonitorNode.execute_plugins();
	});
	this.server_conn.on('error', function(exception) {
		logger.write('Error: ' + exception.message);
		MonitorNode.server_reconnect();
	});
	this.server_conn.on('timeout', function() {
		logger.write('Error: connection to server timed out');
		MonitorNode.server_reconnect();
	});
}

MonitorNode.server_reconnect = function() {
	logger.write('Attempting reconnect to server in 2 seconds...');
	setTimeout(function() {
		MonitorNode.server_connect();
	}, 2000);
}

MonitorNode.execute_plugins = function() {
	if(this.plugin_interval)
		clearInterval(this.plugin_interval);
	
	this.plugin_interval = setInterval(function(){
		for(var plugin in MonitorNode.plugins) {
			MonitorNode.plugins[plugin].poll(function(plugin_name, render, data) {
				MonitorNode.send_data(plugin_name, render, data);
			});
		}
	}, 1000);
}

MonitorNode.send_data = function(plugin, render, data) {
	if(this.server_conn.readyState != 'open' && this.server_conn.readyState != 'writeOnly') {
		logger.write('Error: socket not ready, skipping transmission.');
		return;
	}

	var data = JSON.stringify({'plugin':plugin, 'render':render, 'data':data, 'origin':this.config.node_name});
	
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