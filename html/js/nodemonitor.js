var NM = window.NM || {};

(function(window) {
	
	if(!('console' in window)) {
		window.console = {};
		window.console.log = function(data){ }
	}
	
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
			var data = JSON.parse(msg);
			console.log(data);
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
	
})(window);