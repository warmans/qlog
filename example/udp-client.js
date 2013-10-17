var dgram = require("dgram");

var udp = dgram.createSocket("udp4");

for (i=0;i<10000;i++) {

	var buffer = new Buffer(JSON.stringify({b: 'bucket_' + i, t: "2013-01-01T01:01:01+00:00", v: Math.random()}));
	udp.send(buffer, 0, buffer.length, "43278", "127.0.0.1", function(error){
		if (error) {
			console.log('here');
			console.warn(error);
		} else {
			if(i >= 100){
				udp.close();
			}
		}
	});
}
