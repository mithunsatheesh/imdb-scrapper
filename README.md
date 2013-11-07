imdb-scrapper
=============

nodejs daemon application which will scrap the imdb movie data and insert into the local mongo database. It has a movie dashboard which updates data getting entered into the local database into a dashboard with websockets.


### Requirements

1. Mongo DB installed
2. Node.js installed


### Features used

1. Mongo Grid FS for storing the images scrapped from imdb.
2. Websockets for realtime dashboard.


### Node package dependencies

1. cheerio - as html parser
2. express - for the dashboard app
3. jade - templating engine
4. mongodb - node driver for mongo
5. socket.io - for the realtime push

### Configuration

The configuration of this application can be done via the config.json file in the application root.
The various config parameters are:

1. **mongodb** : The mongo db connection url which has the ip,port, authentication and the db details. If you are connectiong to the local mongo please leave it as such.
The default database used will be imdb connection to the mongo instance at localhost:27017.

2. **mongocollection** : Name the collection to which the movie data has to be inserted. Defaults to events.

3. **movieId** : The imdb movie id from which we have to scrap the data. You can set it to 1 if you want to scrap all the data.
The movie id refers to the integer id in the imdb url after the `tt`.

4. **application_port** : The port at which the dashboard app should run. Defaults to 3000.

5. **req_pool** : The http request pool size. This refers to the maximum number of http requests that would be initiated in parallel to the imdb website.





