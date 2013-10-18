var r = require('rethinkdb');
var dbname = 'qlog';


r.connect({host:"localhost", port:28015}, function(err, conn){
    if(err) {
        console.warn(err);
        return;
    }
    r.dbCreate(dbname).run(conn, function(err, res){
        if(err) {
            console.warn(err);
            return;
        }
        //create the buckets table
        r.db(dbname).tableCreate('buckets', {primary_key: 'b'}).run(conn, function(err, res) {
            if(err) {
                console.warn(err);
                return;
            }
            console.log('OK');
            conn.close();
        });
    });
});
