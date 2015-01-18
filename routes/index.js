var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/api/v1', function(req, res) {
  res.render('index', { title: 'Next Episodes API' });
});

/* GET home page. */
router.get('/api/v1/shows/:query', function(req, res) {
  res.render('index', { title: 'Next Episodes API' });
});

module.exports = router;
