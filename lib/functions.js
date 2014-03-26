//var http = require('http');
var http = require('follow-redirects').http;
var bm = require('./Benchmark')();
var cheerio = require('cheerio');
var config = require('../config.json');

var movieId = config.movieId;


function setStarter(id) {
	
	console.log("start from "+id+" instead of "+movieId);
	movieId = id;
	
}


/**
 * Retrieves html source from imdb.
 * @param {function} cb The callback function to follow.
 */
function GetHtmlData(cb) {
	
	id = ++movieId;	
	bm.reg("GET html");
	//id = 1;
	id = ("00000000"+id).slice(-8);
	
	var options = {
		host: 'in.bookmyshow.com',
		path: '/movies/go/ET'+id
	};
	var req = http.get(options, bindToCb(movieId));

	req.setTimeout( 20000, function( ) {
   		cb({result:null,id:movieId});
	});
	
	function bindToCb(movieId) {
		
		return function(res) {
  
		  var result = "";

		  res.on('data', function (chunk) {
		
			if(res.statusCode === 200) {
			
			 result += chunk; 
			
			}
			
			
		  });
		  
		  res.on("end", function(){

			bm.stop("GET html");
			cb({result:result,id:movieId});
			  
		  });
  
		}
		
	}
	
}

/**
 * Retrieves image binary source from imdb.
 * @param {string} path image url.
 * @param {function} cb The callback function to follow.
 */
function GetImageByUrl(path,cb) {
	
	bm.reg("GET image");
	http.get(path, function(res) {

		var result = "";
		res.setEncoding('binary');
		res.on('data', function (chunk) {

		if(res.statusCode === 200) {

			result += chunk; 

		}
		
		});

		res.on("end", function(){
			
			bm.stop("GET image");
			cb(result);
		  
		});

	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});

}

/**
 * Parses the html source of a movie page.
 * @param {string} result html source as string.
 */
function ParseHtml(result) {
	
	bm.reg("PARSER");
	
	$ = cheerio.load(result.result);
	
	var record = {"_id":result.id};
	
	$ = cheerio.load($('#synopsis').html());
	
	record.title = $('#spnEventTitle').html();
	record.description = $('#dEventSynopsis').html();
	record.duration = $('[itemprop="duration"]').html();
	record.datePublished = $('[itemprop="datePublished"]').next("li").html();
	
	record.image = $("#imgEventImage").attr("src");		
	record.language = $('[itemprop="inLanguage"]').html();
	record.genre = [];
	$('[itemprop="genre"]').each(function(){
		record.genre.push(this.html());
	});
	
	record.directors = [];
	$('[itemprop="director"] [itemprop="name"]').each(function(){
		record.directors.push(this.html());
	});
	
	record.writers = [];
	$('[itemprop="creator"] [itemprop="name"]').each(function(){
		record.writers.push(this.html());
	});
	
	record.actors = [];
	$('[itemprop="actor"] [itemprop="name"]').each(function(){
		record.actors.push(this.html());
	});
		
	bm.stop("PARSER");  
	
	return record;
}	

/**
 * exports
 * function list
 */
module.exports.GetHtmlData = GetHtmlData;
module.exports.GetImageByUrl = GetImageByUrl;
module.exports.ParseHtml = ParseHtml;
module.exports.setStarter = setStarter;
