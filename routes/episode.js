var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var async = require('async');
var Show = require("../models/show").Show;
var Episode = require("../models/episode").Episode;

/* GET single shows. */
router.get('/:id/episode/', function(req, res) {
	Episode.findOne({ 'showId': req.params.id }, function(err, doc) {
		if (doc) {
			var dateCreated = new Date(doc.updated);
			var expiryDate = dateCreated.setDate(dateCreated.getDate() + 7);
			if (Date.now > expiryDate) {
				// Send the user the outdated one
				res.send(JSON.stringify(doc));

				// Create another one
				doc.remove();
				GenerateNextEpisodeForShow(req.params.id, function (obj) {
					// New Episode Saved in DB
				});
			} else {
				res.send(JSON.stringify(doc));
			}
		} else {
		// Find if the show exists
		Show.findOne({ 'ids.trakt': req.params.id }, function(err, doc) {
			if (doc) {
				GenerateNextEpisodeForShow(req.params.id, function (obj) {
					res.send(JSON.stringify(obj));
				});
			} else {
				// create the show first
				GenerateShow(req.params.id, function (show) {
					if (!show.error) {
						GenerateNextEpisodeForShow(req.params.id, function (obj) {
						res.send(JSON.stringify(obj));
					});
					} else {
						res.send(show);
					}
				});
			}
		});
		}
	});
});

function GenerateNextEpisodeForShow (showId, callback) {
	GetLatestSeasonWithRequest(showId, function (response) {
		GetLatestEpisodeWithRequest(showId, response.number, callback);
	});
}

function GetLatestSeasonWithRequest (showId, callback) {
	GetAllSeasonsWithRequest(showId, function (response) {
		response.sort(function(a, b) {
			// Sort seasons by 'number' property
			return b.number - a.number;
		});
		callback(response[0]);
	});
}

function GetAllSeasonsWithRequest (showId, callback) {
	request({ url: 'https://api.trakt.tv/shows/' + showId + '/seasons?extended=full',
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

function GetLatestEpisodeWithRequest (showId, seasonNumber, callback) {
	GetAllEpisodesForSeasonWithRequest (showId, seasonNumber, function (jsonArray) {
		var episodes = [];
		async.each(jsonArray, function(e, finished) {
			var airDate = new Date(e.first_aired);
			if (Date.now() < airDate) {
				episodes.push(e);
				finished();
			} else {
				finished();
			}
		}, function(err) {
			if (episodes.length) {
				episodes.sort(function (a, b) {
					return a.number - b.number;
				});

				var latest = episodes[0];
				Episode.create({
					showId: showId,
					season: latest.season,
					number: latest.number,
					title: latest.title,
					ids: latest.ids,
					first_aired: latest.first_aired,
					rating: latest.rating,
					votes: latest.votes,
					overview: latest.overview,
					available_translations: latest.available_translations
				}, function(err, doc) {
					if (err) return console.log(err);
					callback(doc);
				});
			} else {
				callback({ "error": "No new episodes available." })
			}
		});
	});
}

function GetAllEpisodesForSeasonWithRequest (showId, seasonNumber, callback) {
	request({ url: 'https://api.trakt.tv/shows/' + showId + '/seasons/' + seasonNumber + '?extended=full',
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
		// check if show is currently running before creating, otherwise don't bother
		if (response.status == "returning series" || response.status == "in production") {
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
		} else {
			callback({ "error": "Show has ended."});
		}	
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
