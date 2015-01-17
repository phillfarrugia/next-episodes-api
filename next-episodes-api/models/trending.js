var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ShowSchema = require("../models/show").ShowSchema;

var TrendingSchema = new Schema({
    shows: [ShowSchema],
   	updated: { type: Date, default: Date.now }
});

var Trending = mongoose.model('Trending', TrendingSchema);

module.exports = {
  Trending: Trending
}
