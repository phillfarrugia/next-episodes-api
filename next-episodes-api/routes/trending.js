var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var async = require('async');
var Show = require("../models/show").Show;
var Trending = require("../models/trending").Trending;

/* GET trending shows. */
router.get('/', function(req, res) {
	Trending.findOne({}, function(err, doc) {
		if (err) return console.log(err);
		if (doc) {
			var dateCreated = new Date(doc.updated);
			var expiryDate = dateCreated.setDate(dateCreated.getDate() + 7);
			if (Date.now() > expiryDate) {
				doc.remove();
				GenerateTrendingShowsList(function(obj) {
					res.send(JSON.stringify(obj));
				});
			} else {
				res.send(JSON.stringify(doc.shows));
			}
		} else {
			GenerateTrendingShowsList(function(trending) {
					res.send(JSON.stringify(trending));
			});
		}
	});
});

function GenerateTrendingShowsList (callback) {
	request({ url: 'https://api.trakt.tv/shows/trending',
		headers: {
			'Content-Type': 'application/json',
			'trakt-api-key': '2d90c6c30a7efebc1dcef8464d16cf9a46cc9a56f23ec51a3ae3681aaa96634c',
			'trakt-api-version': '2'
		}
	}, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	var jsonArray = JSON.parse(body);
	  	GenerateShowsList(jsonArray, function(Shows) {
	  		Trending.create({
	  			shows: Shows
	  		}, function(err, docs) {
	  			if (err) return console.log(err);
	  			console.log('Trending Shows created in DB');
	  			callback(docs);
	  		});
	  	});
	  }
})
}

function GenerateShowsList (jsonArray, callback) {
	var shows = [];
	async.each(jsonArray, function(s, finished) {
		Show.find({ 'ids.trakt': s.show.ids.trakt }, function (err, docs) {
			if (err) return console.log(err);
			if (!docs.length) {
				GenerateShow(s.show, function(show) {
					shows.push(show);
					finished();
				})
			} else {
				shows.push(docs[0]);
				finished();
			}
	});
	}, function(err) {
		if (shows.length == jsonArray.length) {
			callback(shows);
		} else {
			return console.log(err)
		}
	});
}

function GenerateShow (json, callback) {
	GetFullShowWithRequest(json, function(response) {
		Show.create({
			title: response.title,
			year: response.year,
			ids: {
				trakt: response.ids.trakt,
				slug: response.ids.slug,
				tvdb: response.ids.tvdb,
				imdb: response.ids.imdb,
				tmdb: response.ids.tmdb,
				tvrage: response.ids.tvrage
			},
			overview: response.overview,
			first_aired: response.first_aired,
			airs: {
				day: response.airs.day,
				time: response.airs.time,
				timezone: response.airs.timezone
			},
			runtime: response.runtime,
			certification: response.certification,
			network: response.network,
			country: response.country,
			trailer: response.trailer,
			homepage: response.homepage,
			status: response.status,
			rating: response.rating,
			votes: response.votes,
			updated_at: response.updated_at,
			language: response.language,
			available_translations: response.available_translations,
			genres: response.genres,
			aired_episodes: response.aired_episodes,
			images: response.images
	}, function (err, doc) {
			if (err) return console.log(err);
			callback(doc);
			console.log(doc.title + ' saved in DB');
		});	
})
}

function GetFullShowWithRequest(json, callback) {	
	request({ url: 'https://api.trakt.tv/shows/' + json.ids.trakt + '?extended=full,images',
		headers: {
			'Content-Type': 'application/json',
			'trakt-api-key': '2d90c6c30a7efebc1dcef8464d16cf9a46cc9a56f23ec51a3ae3681aaa96634c',
			'trakt-api-version': '2'
		}
	}, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			callback(JSON.parse(body));
		  }
		});
}

module.exports = router;