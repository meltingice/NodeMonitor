var NM = window.NM || {};

(function(window) {
	
	if(!('console' in window)) {
		window.console = {};
		window.console.log = function(data){ }
	}
	
	NM.nodes = {};
	
	NM.init = function() {
		io.setPath('/js/socket_io/');
		
		/*
		 * The socket address here will be automatically inserted
		 * when the file is accessed. The value used is the http_listen_addr
		 * defined in the NodeMonitor server config.
		 */
		NM.socket = new io.Socket({*NODEMONITOR_SERVER_ADDR*});
		NM.connect();
		
		NM.socket.on('connect', function() {
			console.log("Connected to NodeMonitor!");
		});
		
		NM.socket.on('disconnect', function() {
			console.log("Connection to NodeMonitor lost!");
			NM.socket = new io.Socket({*NODEMONITOR_SERVER_ADDR*});
			NM.connect();
		});
		
		NM.socket.on('message', function(msg) {
			NM.parse_data(msg);
		});
	}	
	
	NM.connect = function() {
		if(NM.socket.connected) return;
		
		console.log("Attempting to connect to NodeMonitor...");
		NM.socket.connect();
		
		/*
		 * This is supposed to reconnect to the WebSocket server
		 * automatically if the connection is lost for whatever reason.
		 * For some reason its not reconnecting though. Input welcome.
		 */
		
		/*var timeout = setTimeout(function() {
			if(NM.socket.connected) {
				clearTimeout(timeout);
			} else {
				NM.connect();
			}
		}, 2000);*/
	}
	
	NM.parse_data = function(data) {
		try{
			
			data = JSON.parse(data);
			if(!this.nodes[data.origin]) {
				this.add_node(data.origin);
			}
			
			if(!this.nodes[data.origin].plugins[data.plugin]) {
				this.add_plugin(data.origin, data.plugin, data.render);
			}
			
			this.nodes[data.origin].plugins[data.plugin].data = data.data;
			this.render_data(data);
			
		} catch(err){ }
	}
	
	NM.add_node = function(name) {
		if(!this.nodes[name]) {
			this.nodes[name] = {
				name: name,
				plugins: {}
			};
			
			NMR.add_node(name);
		}
	}
	
	NM.add_plugin = function(node, name, render) {
		this.nodes[node].plugins[name] = {
			render: render,
			data: null
		};
		
		NMR.add_plugin(node, name);
	}
	
	// The rendering class
	var NMR = {};
	
	NMR.name_to_css = function(name) {
		return name.replace(/([^A-Za-z0-9_-]+)/g, '');
	}
	
	NMR.add_node = function(name) {
		var div_name = 'node-'+this.name_to_css(name);
		$('<div />')
			.attr('id', div_name)
			.html('<h1>'+name+'</h1>\n<div class="node-content"></div>\n')
			.appendTo('#nodes');
	}
	
	NMR.add_plugin = function(node, name) {
		var plugin = NM.nodes[node].plugins[name];
		switch(plugin.render.type) {
			case 'text': return this.add_text_plugin(node, name);
			case 'table': return this.add_table_plugin(node, name);
		}
	}
	
	NMR.add_text_plugin = function(node, name) {
		var plugin = NM.nodes[node].plugins[name];
		
		var parent = 'node-'+this.name_to_css(node);
		var class = 'plugin-'+this.name_to_css(name);
		$('<div />')
			.addClass(class)
			.addClass('text-plugin')
			.html('<h1>'+plugin.render.title+'</h1><div class="plugin-content"></div>')
			.appendTo('#'+parent+'> .node-content');
	}
	
})(window);