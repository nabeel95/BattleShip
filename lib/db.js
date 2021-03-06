var pg = require('pg');
var _ = require('lodash');
var db = {};
var con ={
		host     : process.env.OPENSHIFT_POSTGRESQL_DB_HOST||"127.0.0.1",
		user     : process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME||"admin3uxsxtt",
		password : process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD||"ZAhH2aFZmCYG",
		port     : process.env.OPENSHIFT_POSTGRESQL_DB_PORT||"5433",
		database : 'battleship',
	};

var conString = 'postgres://'+con.user+':'+con.password+'@'+con.host+':'+con.port+'/'+con.database;
db.insertInfo = function(name,accuracy) {
	pg.connect(conString,function(err,client,done){
		if(err) return console.error('error :',err);
		client.query("insert into highscores (name,accuracy,time) VALUES('"+name+"',"+accuracy+",localtimestamp)",function(err,result){
			if(err) console.log(err);
			done()});
	});
};

var createQuery = function (position){
	var row  = position.slice(0,1);
	var column = position.slice(1);
	var query = "('"+row+"',"+column+")";
	return query;
}


db.insertShipInfo = function(positions){
	var query = positions.map(createQuery).join();

	pg.connect(conString,function(err,client,done){
		if(err) return console.error('error :',err);
		client.query("update ship_positions set counts=counts+1 where (row_id,column_id) in ("+query+")",function(err,result){
			if(err) console.log(err);
			done()});
	});
}




db.getHighscore = function(res){
	var result = [];
	pg.connect(conString,function(err,client,done){
		if(err) console.log(err);
		var query = client.query('select * from highscores order by accuracy desc')
		query.on('row',function(row){
			result.push(row);
		});
		query.on('end',function(){
			client.end();
			res.send(JSON.stringify(result));
		});
	});
};



db.getShipPlacementData = function(res){
	var result = [];
	pg.connect(conString,function(err,client,done){
		if(err) console.log(err);
		var query = client.query('select * from ship_positions order by row_id,column_id')
		query.on('row',function(row){
			result.push(row);
		});
		query.on('end',function(){
			client.end();
			res.send(JSON.stringify(result));
		});
	});
};

module.exports=db;
