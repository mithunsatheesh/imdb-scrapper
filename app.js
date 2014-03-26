var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var functions = require('./lib/functions');
var config = require('./config.json');
var fs = require('fs');

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
	
	try {
		
		collection.find().sort({"_id": -1}).limit(1).toArray(function(err, results) {
			
			if(typeof(results[0])!="undefined") {
				functions.setStarter(results[0]._id);
			}
			
		});
			
		var ProcessHtmlResponse =  function(result) {
						
			if(++queue <= pool) {
				
				functions.GetHtmlData(ProcessHtmlResponse);
				
			} 

			if(result.result == null) {
				
				functions.GetHtmlData(ProcessHtmlResponse);

			}						
	
			var record = functions.ParseHtml(result);
			
			/**
			* feed to dashboard
			*/		
			io.sockets.volatile.emit('movie_feed', record);		

			if(typeof(record.image)!="undefined") {
				
				var tmp = record.image.split(".");
				record.location = record._id+"."+tmp[tmp.length-1];
				
				collection.insert(record, function(err, docs) {
					
					functions.GetImageByUrl(record.image,function(data){
						record.location = record.location.split("?")[0];
						fs.writeFile('./static/'+record.location, data, 'binary', function(err){
							
							if (err) {
								console.log(err);
							}
							--queue;
							return functions.GetHtmlData(ProcessHtmlResponse);
							
						});					
						
										
					});
					
				});
				
			} else {
				
				--queue;
				setTimeout( function() {
					return functions.GetHtmlData(ProcessHtmlResponse);
				}, 10000 );
					
			
			}
				
							
							
		}
		
		functions.GetHtmlData(ProcessHtmlResponse);
	
	} catch(e) {
	
		collection.find().sort({"_id": -1}).limit(1).toArray(function(err, results) {
				
			if(typeof(results[0])!="undefined") {
				functions.setStarter(results[0]._id);
			}
			
		});
		functions.GetHtmlData(ProcessHtmlResponse);
	
	}


});


