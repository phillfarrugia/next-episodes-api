var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var Show = require("../models/show").Show;
var Trending = require("../models/trending").Trending;

/* GET home page. */
router.get('/api/v1', function(req, res) {
  res.render('index', { title: 'Next Episodes API' });
});

/* GET trending shows. */
router.get('/api/v1/trending', function(req, res) {

	// Do trending shows exist in DB?
	Trending.findOne({}, function(err, trending) {
		if (err) return console.log(err);

		if (trending) {
			var dateCreated = new Date(trending.updated);
			var expiryDate = dateCreated.setDate(dateCreated.getDate() + 7);
			var utcExpiryDate = new Date(expiryDate).toISOString();

			if (Date.now() > expiryDate) {

				trending.remove();

				generateTrendingShows(function(trending) {
					res.send(JSON.stringify(trending));
				});
			} else {
				res.send(JSON.stringify(trending.shows));
			}
		} else {
			generateTrendingShows(function(trending) {
					res.send(JSON.stringify(trending));
			});
		}
	})
});

/* GET single shows. */
router.get('/api/v1/shows/:id', function(req, res) {
  res.render('index', { title: 'Next Episodes API' });
});

function generateTrendingShows (callback) {
	var trendingShows = {
		url: 'https://api.trakt.tv/shows/trending',
		headers: {
			'Content-Type': 'application/json',
			'trakt-api-key': '2d90c6c30a7efebc1dcef8464d16cf9a46cc9a56f23ec51a3ae3681aaa96634c',
			'trakt-api-version': '2'
		}
	};

	request(trendingShows, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	var shows = JSON.parse(body);
	  	createShows(shows, function(newShowsArray) {
	  		Trending.create({
	  			shows: newShowsArray
	  		}, function(err, trending) {
	  			console.log('trending shows saved in db');
	  			callback(trending);
	  		});
	  	});
	  }
})
}

function createShows(shows, callback) {
	var showsArray = [];
	var x;

	for (x in shows) {
		console.log(shows[x].show.title);

		createShow(shows[x].show, function(s) {
			if (showsArray.indexOf(s) == -1) {
				showsArray.push(s);
			}

			if (showsArray.length == shows.length) {
				callback(showsArray);
			}
		})
	}
}

function createShow (show, callback) {
	requestShowSummary(show, function(response) {

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
	}, function (err, show) {
			if (err) return console.log(err);
			callback(show);
			console.log(show.title + ' saved to db');
		});	
})
}

function requestShowSummary(show, callback) {	
	var fullShowRequest = {
		url: 'https://api.trakt.tv/shows/' + show.ids.trakt + '?extended=full,images',
		headers: {
			'Content-Type': 'application/json',
			'trakt-api-key': '2d90c6c30a7efebc1dcef8464d16cf9a46cc9a56f23ec51a3ae3681aaa96634c',
			'trakt-api-version': '2'
		}
	};	

	request(fullShowRequest, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			callback(JSON.parse(body));
		  }
		});
}

module.exports = router;
