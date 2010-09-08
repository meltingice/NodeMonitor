/*
 * NodeMonitor
 * Copyright 2010 Ryan LeFevre - @meltingice
 *
 * Licensed under the New BSD License, more info in LICENSE file
 * included with this software.
 *
 * Source code is hosted at http://github.com/meltingice/NodeMonitor
 * =================================================================
 * Name: Memcached Stats Plugin
 * Desc: Reports memcached statistics
 */
 
var memcached = require('./../lib/node-memcached/node-memcached');

this.name = 'memcached_stats';

this.set_options = function(options) {
	this.options = options;
}

this.set_defaults = function() {
	this.options = {
		addr: 'localhost',
		port: 11211
	};
}
 
this.poll = function(callback) {
	if(!this.options) {
		this.set_defaults();
	}
	
	var self = this;
	memcached.connect(this.options.addr, this.options.port, function() {
		memcached.stats(function(stats) {
			memcached.disconnect();
			
			var table = new Array();
			for(var key in stats) {
				table.push([key, stats[key]]);
			}
			
			callback(self.name, self.render(), table);
		})
	});
}

this.render = function() {
	return {
		type: 'table',
		title: 'Memcached Stats',
		cols: ['Data', 'Value']
	};
}