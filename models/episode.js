var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EpisodeSchema   = new Schema({
    showId: Number,
    updated: { type: Date, default: Date.now },
    season: Number,
    number: Number,
    title: String,
    ids: {
    	trakt: Number,
    	tvdb: Number,
    	tmdb: Number,
    	tvrage: Number
    },
    first_aired: String,
	rating: Number,
    votes: Number,
    overview: String,
    available_translations: [String]
});

var Episode = mongoose.model('Episode', EpisodeSchema);

module.exports = {
  Episode: Episode
}
