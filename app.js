var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var functions = require('./lib/functions');
var config = require('./config.json');

/**
 * pool relates to the parallel http request pool size
 * queue refers to the number of http requests active now.
 */
var pool = parseInt(config.req_pool);
var queue = 0;


var express = require('express');
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(config.application_port);

app.use(app.router);
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

/**
 * Scrapper application dashboard
 */
app.get('/', function(req, res){
  res.render('index', { port:config.application_port  });
});


MongoClient.connect(config.mongodb, function(err, db) {
	
	var collection = db.collection(config.mongocollection);	
		
	var ProcessHtmlResponse =  function(result) {
					
		if(++queue <= pool) {
			
			functions.GetHtmlData(ProcessHtmlResponse);
			
		}
		
		var record = functions.ParseHtml(result);
		
		/**
		* feed to dashboard
		*/		
		io.sockets.volatile.emit('movie_feed', record);				
		
		collection.insert(record, function(err, docs) {

			if(typeof(record.image)!="undefined") {
			
				functions.GetImageByUrl(record.image,function(data){
				
					var gs = new mongodb.GridStore(db, result.id+".jpg", "w", {
						"content_type": "image/jpg",
						"metadata":{
							"author": "author"
						},
						"chunk_size": 1024*4
					});
				
					gs.open(function(err, gs){
						  gs.write(data, function(){
							
							  --queue;
							  return functions.GetHtmlData(ProcessHtmlResponse);
							  
						  })
					});
				
				});
				
			} else {
			
				--queue;
				return functions.GetHtmlData(ProcessHtmlResponse);
			
			}
			
		});				
						
	}
	
	functions.GetHtmlData(ProcessHtmlResponse);

});


