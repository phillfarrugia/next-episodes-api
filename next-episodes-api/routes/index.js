var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var Show = require("../models/show").Show;

/* GET home page. */
router.get('/api/v1', function(req, res) {
  res.render('index', { title: 'Next Episodes API' });
});

/* GET trending shows. */
router.get('/api/v1/trending', function(req, res) {
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
	  	createShows(shows);
		res.send(shows);
	  }
	})
});

/* GET single shows. */
router.get('/api/v1/shows/:id', function(req, res) {
  res.render('index', { title: 'Next Episodes API' });
});

function createShows(shows) {
	for (i=0; i < shows.length; i++) {
		createShow(shows[i].show);
	}
}

function createShow (show) {
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
			//saved
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
