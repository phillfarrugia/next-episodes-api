var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var async = require('async');
var Show = require("../models/show").Show;
var Episode = require("../models/episode").Episode;

/* GET home page. */
router.get('/api/v1', function(req, res) {
  res.render('index', { title: 'Next Episodes API' });
});

/* GET single shows. */
router.get('/api/v1/show/:id/episode/', function(req, res) {

	Episode.find({ 'ids.trakt': req.params.id }, function(err, docs) {
		if (!docs.length) {

			// create episode
			GenerateNextEpisodeForShow(req.params.id, function (obj) {
				res.send(JSON.stringify(obj));
			});

		} else {
			res.send(JSON.stringify(docs[0]));
		}
	})
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
					season: latest.season,
					number: latest.number,
					title: latest.title,
					ids: latest.ids,
					first_aired: latest.first_aired,
					updated_at: latest.updated_at,
					rating: latest.rating,
					votes: latest.votes,
					overview: latest.overview,
					available_translations: latest.available_translations
				}, function(err, doc) {
					if (err) return console.log(err);
					callback(doc);
				});
			} else {
				callback({ "Error": "No new episodes available." })
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

module.exports = router;
