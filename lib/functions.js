var http = require('http');
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
	id = ("000000"+id).slice(-7);
	
	var options = {
		host: 'www.imdb.com',
		path: '/title/tt'+id+'/'
	};
	
	http.get(options, bindToCb(movieId));
	
	
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
	
	record.awards = [];
	$('#titleAwardsRanks [itemprop="awards"]').each(function(){
		
		record.awards.push(this.text());
	
	});
	
	record.related = [];
	$('.rec_page .rec_item').each(function(){
		
		record.related.push(this.attr("data-tconst"));
	
	});
	
	record.image = $('#img_primary [itemprop="image"]').attr("src");
	
	if(typeof(record.image)=="undefined") {
		return record;
	}
	
	$ = cheerio.load($('#overview-top').html());
	
	record.title = $('.header .itemprop').html();
	record.description = $('[itemprop="description"]').html();
	record.duration = $('[itemprop="duration"]').attr("datetime");
	record.contentRating = $('[itemprop="contentRating"]').attr("content");
	record.datePublished = $('[itemprop="datePublished"]').html();
	
	var rating = {};
	rating.ratingValue = $('[itemprop="ratingValue"]').html();
	rating.bestRating = $('[itemprop="bestRating"]').html();
	rating.ratingCount = $('[itemprop="ratingCount"]').html();
	rating.ratingCount = [];
	$('[itemprop="reviewCount"]').each(function(){
		rating.ratingCount.push(this.html());
	});
	record.rating = rating;
		
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
	$('[itemprop="actors"] [itemprop="name"]').each(function(){
		record.writers.push(this.html());
	});
		
	record.realeased = $('.header .nobr a').html();	
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
