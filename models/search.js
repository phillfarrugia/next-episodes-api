var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ShowSchema = require("../models/show").ShowSchema;

var SearchSchema = new Schema({
    shows: [ShowSchema],
    query: String,
   	updated: { type: Date, default: Date.now }
});

var Search = mongoose.model('Search', SearchSchema);

module.exports = {
  Search: Search
}
