var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/api/v1', function(req, res) {
  res.render('index', { title: 'Next Episodes API' });
});

/* GET trending shows. */
router.get('/api/v1/trending', function(req, res) {

	var trendingshows = {
		url: 'https://api.trakt.tv/shows/trending',
		headers: {
			'Content-Type': 'application/json',
			'trakt-api-key': '2d90c6c30a7efebc1dcef8464d16cf9a46cc9a56f23ec51a3ae3681aaa96634c',
			'trakt-api-version': '2'
		}
	};
	
	request(trendingshows, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		console.log(body)
		res.send(body);
	  }
	})
});

/* GET single shows. */
router.get('/api/v1/shows/:id', function(req, res) {
  res.render('index', { title: 'Next Episodes API' });
});

module.exports = router;
