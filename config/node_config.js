// The unique indentifier/name of this node
this.node_name = "Server 1";

// The address where the server is listening
this.server_addr = '127.0.0.1';

// The port where the server is listening
this.server_port = 88;

// Optional plugin options
this.plugin_options = {
	'memcached_stats' : {
		'addr': 'localhost',
		'port': 11211
	}
};