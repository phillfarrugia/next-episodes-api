var express = require('express');
var router = express.Router();
var Show = require("../models/show").Show;
var Trending = require("../models/trending").Trending;
var Episode = require("../models/episode").Episode;
var Search = require("../models/search").Search;

/* PURGE ALL shows */
router.get('/shows', function(req, res) {
	Show.remove({}, function(err) { 
	   res.send(JSON.stringify({ "error": err }));
	});
})

/* PURGE ALL trendings */
router.get('/trendings', function(req, res) {
	Trending.remove({}, function(err) { 
	   res.send(JSON.stringify({ "error": err }));
	});
})

/* PURGE ALL episodes */
router.get('/episodes', function(req, res) {
	Trending.remove({}, function(err) { 
	   res.send(JSON.stringify({ "error": err }));
	});
})

/* PURGE ALL searches */
router.get('/searches', function(req, res) {
	Search.remove({}, function(err) { 
	   res.send(JSON.stringify({ "error": err }));
	});
})

module.exports = router;
