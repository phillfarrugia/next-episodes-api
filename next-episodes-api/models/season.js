var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SeasonSchema   = new Schema({
    number: Number,
    ids: {
    	trakt: Number,
    	tvdb: Number,
    	tmdb: Number,
    	tvrage: Number
    },
    rating: Number,
    votes: Number,
    episode_count: Number,
    overview: String
});

module.exports = mongoose.model('Season', SeasonSchema);
