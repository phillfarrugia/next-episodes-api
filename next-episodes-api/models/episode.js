var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EpisodeSchema   = new Schema({
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
	updated_at: String,
	rating: Number,
    votes: Number,
    overview: String,
    available_translations: [String]
});

var Episode = mongoose.model('Episode', EpisodeSchema);

module.exports = {
  Episode: Episode
}
