/*
 * NodeMonitor
 * Copyright 2010 Ryan LeFevre - @meltingice
 *
 * Licensed under the New BSD License, more info in LICENSE file
 * included with this software.
 *
 * Source code is hosted at http://github.com/meltingice/NodeMonitor
 * =================================================================
 * Name: System Uptime Plugin
 * Desc: Reports system uptime and system load
 */

this.poll = function(callback) {
	var exec = require('child_process').exec,
		child;
	
	child = exec('uptime', function(error, stdout, stderr) {
		callback("Uptime", stdout);
	});
}