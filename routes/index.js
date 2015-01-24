var express = require('express');
var router = express.Router();
var Show = require("../models/show").Show;

/* GET home page. */
router.get('/api/v1', function(req, res) {
  res.render('index', { title: 'Next Episodes API' });
});

module.exports = router;
