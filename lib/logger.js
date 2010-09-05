var dest = 'server';
var log_console = false;

var fs 		= require('fs'),
	exec	= require('child_process').exec;

this.set_dest = function(set_dest) {
	dest = set_dest;
}

this.enable_console = function(set) {
	log_console = set;
}

this.write = function(msg) {
	if(log_console)
		console.log(msg);

	var filename = './logs/'+dest+'_log';
	msg += '\n';
	fs.open(filename, 'a', 0666, function(err, fd) {
		if(err) return;
		
		exec('date "+%Y-%m-%d %H:%M:%S"', function(err, stdout, stderr) {
			if(err) return;
			
			msg = stdout.replace('\n', '') + ' - ' + msg;
			fs.write(fd, msg, null, 'utf8', function(err, written) {
			});
		});
	});
}