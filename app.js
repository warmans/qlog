var dgram = require("dgram");
var server = dgram.createSocket("udp4");
var r = require('rethinkdb');

server.on("listening", function(){
	var address = server.address();
	console.log('listening on ' + address.address + ':' + address.port);
});

server.on("message", function (raw, rinfo) {

    //new message
	console.log("server got: " + raw + " from " + rinfo.address + ":" + rinfo.port);
    var data = JSON.parse(raw.utf8Data || raw);

    //connect to DB
	r.connect({host:"localhost", port:28015}, function(err, conn){

        //failed to connect
        if (err) {
            console.warn(err);
            return false;
        }

        //handler for data
        var data_handler = function(err, res) {

            if (err) {
                console.warn(err);
                return false;
            }

            console.log('running insert');

            //insert the data
            r.db('qlog').table(data.b).insert({"t": r.ISO8601(data.t), "v": data.v}).run(conn, function(err, res){
                if (err) {
                    console.warn(err);
                    console.log('forgetting bucket');
                    //table doesn't appear to exist - remove it from buckets list so we attempt to re-create it next time
                    r.db('qlog').table('buckets').get(data.b).delete().run(conn, function(err, res){});
                }
            });
        };

        r.db('qlog').table('buckets').get(data.b).run(conn, function(err, res) {

            if (err) {
                console.warn(err);
                return false;
            }

            //this does not exist yet
            if (!res) {

                console.log('creating table');

                //create table
                r.db('qlog').tableCreate(data.b, {durability : 'hard'}).run(conn, function(err, res) {

                    //table already exists?
                    console.warn(err);

                    //in some cases the key might already exist so upsert
                    r.db('qlog').table('buckets').insert({"b":data.b}, {durability: 'hard', upsert: true}).run(conn, function(err, res) {

                        r.db('qlog').table(data.b).indexList().run(conn, function(err, res){
                            if (err) {
                                return;
                            }

                            console.log(res);

                            //index already exists
                            if (res['t']) {
                                return;
                            }
                            //if no error we must have created a new table so index the time field
                            r.table(data.b).indexCreate('t').run(conn, data_handler);
                        });
                    });
                });
            } else {
                //just insert
                data_handler(err, res);
            }
        });
    });
});

//serve
server.bind(43278);
