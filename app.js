var dgram = require("dgram");
var server = dgram.createSocket("udp4");
var r = require('rethinkdb');

server.on("listening", function(){
	var address = server.address();
	console.log('listening on ' + address.address + ':' + address.port);
});

server.on("message", function (raw, rinfo) {
	console.log("server got: " + raw + " from " + rinfo.address + ":" + rinfo.port);
    var data = JSON.parse(raw.utf8Data || raw);

	r.connect({host:"localhost", port:28015}, function(err, conn){
		if(err) throw err;

		//create table
		r.db('test').tableCreate(data.b).run(conn, function(err, res) {

			//how can we find out if a table exists without listing them all?
			if (err) { 
				console.log('ignoring table create error');
			} else {
				//if no error we must have created a new table so index the time field
				r.table(data.b).indexCreate('t');
			}
			
			r.table(data.b).insert({"t": r.ISO8601(data.t), "v": data.v}).run(conn, function(err, res){
				if(err) throw err;
				console.log('OK');
			});
		});
		
    });
});

server.bind(43278);
