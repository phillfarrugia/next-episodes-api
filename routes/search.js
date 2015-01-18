var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var async = require('async');
var Show = require("../models/show").Show;
var Search = require("../models/search").Search;

/* GET home page. */
router.get('/:query', function(req, res) {
	Search.findOne({ 'query': req.params.query }, function(err, doc) {
		if (doc) {
			var dateCreated = new Date(doc.updated);
			var expiryDate = dateCreated.setDate(dateCreated.getDate() + 7);
			if (Date.now > expiryDate) {
				doc.remove();
				GenerateNewSearchList(req.params.query, function (obj) {
					// new Search list saved in db
					res.send(JSON.stringify(obj));
				});
			} else {
				res.send(JSON.stringify(doc));
			}
		} else {
			GenerateNewSearchList(req.params.query, function(obj) {
				// new Search list saved to db
				res.send(JSON.stringify(obj));
			});
		}
	})
});

function GenerateNewSearchList(query, callback) {
	GetSearchResultsWithRequest(query, function(response) {
		var shows = [];
		async.each(response, function(s, finished) {
			Show.findOne({ 'ids.trakt': s.show.ids.trakt }, function (err, doc) {
				if (doc) {
					var dateCreated = new Date(doc.updated);
					var expiryDate = dateCreated.setDate(dateCreated.getDate() + 14);
					if (Date.now > expiryDate) {
						// expired so create a new one
						doc.remove();
						GenerateShow (s.show.ids.trakt, function (show) {
							finished();
						});
					} else {
						shows.push(doc);
						finished();
					}	
				} else {
					// doesn't exist so create a new one
					GenerateShow (s.show.ids.trakt, function (show) {
						shows.push(show);
						finished();
					});
				}
			});
		}, function(err) {
			// processing iterator is compelete
			if (shows.length == response.length) {
				callback(shows);
			}
		});
	});
}

function GetSearchResultsWithRequest (query, callback) {
	request({ url: 'https://api.trakt.tv/search?query=' + query + '&type=show',
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

function GenerateShow (showId, callback) {
	GetFullShowWithRequest(showId, function(response) {
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

function GetFullShowWithRequest(showId, callback) {	
	request({ url: 'https://api.trakt.tv/shows/' + showId + '?extended=full,images',
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
