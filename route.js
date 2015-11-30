var fs = require('fs');
var querystring = require('querystring');
var lib = require('./battleShip.js');
var method_not_allowed = function(req, res){
	res.statusCode = 405;
	console.log(res.statusCode);
	res.end('Method is not allowed');
};
var checkAndSubmit = function(req, res){
	var data = '';
	req.on('data', function(chunk){
		data += chunk;
	});
	req.on('end', function(){
		var args = data.split(" ");
		var name = args[0];
		var shipIndex = args[1];
		var startingPoint = args[2];
		var align = args[3];
		var player;
		lib.players.forEach(function(element){
			if(element.name == req.headers.cookie){
				player = element;
			};
		});
		console.log(player.name,">>>>>>>>>>player");
		lib.positionShip(player.ships[shipIndex],align,startingPoint,player.grid);
		console.log(player.ships[0].coordinates,">>>>in route.js");
		res.end(JSON.stringify(player.grid.usedCoordinates));
	});
}
var createPlayer = function(req, res){
	var data = '';
	req.on('data', function(chunk){
		data += chunk;
	});
	req.on('end', function(){
		var entry = querystring.parse(data);
		lib.players.push(new lib.Player(entry.name));
		res.writeHead(200,
			{'Set-Cookie':entry.name});
		res.end()
	});
};

var serveIndex = function(req, res, next){
	req.url = '/index.html';
	next();
};

var showDetails = function(req,res) {
	res.end(JSON.stringify(lib.players));
}

var serveStaticFile = function(req, res, next){
	var filePath = './public' + req.url;
	fs.readFile(filePath, function(err, data){
		if(data){
			res.statusCode = 200;
			console.log(res.statusCode);
			res.end(data);
		}
		else{
			next();
		}
	});
};

var areBothReady = function(){
	return lib.players.every(function(player){
		return player.isReady;
	});	
};

var routingToGame = function(req,res){
	var player;
	lib.players.forEach(function(element){
		if(element.name == req.headers.cookie){
			player = element;
		};
	});
	player.isReady=true;
	res.end(Number(areBothReady()).toString());

}



var fileNotFound = function(req, res){
	res.statusCode = 404;
	console.log(req.url);
	res.end('Not Found');
	// console.log(res.statusCode);
};

exports.post_handlers = [
	{path: '^/player$', handler: createPlayer},
	{path:'^/placingOfShip$',handler:checkAndSubmit},
	// {path: '^/place$', handler: placeShip},
	{path: '', handler: method_not_allowed}
];
exports.get_handlers = [
	{path: '^/$', handler: serveIndex},
	{path: '^/show$', handler: showDetails},
	{path:'^/makeReady$',handler:routingToGame},
	// {path: '^/ready$', handler: isReady},
	// {path: '^/gamePage.html$', handler: isReady},
	{path: '', handler: serveStaticFile},
	{path: '', handler: fileNotFound}
];

