var dgram = require("dgram");

function send (buffer) {
    var udp = dgram.createSocket("udp4");
    udp.send(buffer, 0, buffer.length, "43278", "127.0.0.1", function (error) {
        if (error) {
            console.warn(error);
        } else {
            udp.close();
        }
    });
}

send(new Buffer(JSON.stringify({b: 'test_bucket_1', t: new Date().toISOString(), v: Math.random()})));
send(new Buffer(JSON.stringify({b: 'test_bucket_2', t: new Date().toISOString(), v: Math.random()})));
send(new Buffer(JSON.stringify({b: 'test_bucket_3', t: new Date().toISOString(), v: Math.random()})));
send(new Buffer(JSON.stringify({b: 'test_bucket_4', t: new Date().toISOString(), v: Math.random()})));
