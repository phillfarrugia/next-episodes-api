var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var async = require('async');
var Show = require("../models/show").Show;
var Search = require("../models/search").Search;
var moment = require('moment-timezone');

/* GET home page. */
router.get('/', function(req, res) {
	Search.findOne({ 'query': req.query.query }, function(err, doc) {
		if (doc) {
			var dateCreated = new Date(doc.updated);
			var expiryDate = dateCreated.setDate(dateCreated.getDate() + 7);
			if (Date.now > expiryDate) {
				doc.remove();
				GenerateNewSearchList(req.query.query, function (obj) {
					// new Search list saved in db
					res.send(JSON.stringify(obj));
				});
			} else {
				res.send(JSON.stringify(doc));
			}
		} else {
			GenerateNewSearchList(req.query.query, function(obj) {
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
				Search.create({
					shows: shows,
					query: query
				}, function(err, doc) {
				if (err) return console.log(err);
				callback(doc);
				console.log('Search query: ' + doc.query + ' saved in DB');
				});
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
		var airDate = ParseAirDate(response.airs);

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
			airs: airDate,
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

function ParseAirDate(json) {
	if (json.airs != null && json.day != null && json.timezone != null) {
		var dayOfWeek = json.day;
		var timeStamp = json.time;
		var timeZone = json.timezone;
		var components = timeStamp.split(":");
		var hour = components[0];
		var minutes = components[1];

		var date = moment().day(dayOfWeek).hour(hour).minutes(minutes);
		var timeZoneDate = moment.tz(date, timeZone);

		return timeZoneDate.valueOf().toString();
	} else {
		return null;
	}
}

module.exports = router;
