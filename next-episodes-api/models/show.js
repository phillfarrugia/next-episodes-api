var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ShowSchema   = new Schema({
    title: String,
    updated: { type: Date, default: Date.now },
    year: Number,
    ids: {
    	trakt: Number,
    	slug: String,
    	tvdb: Number,
    	imdb: String,
    	tmdb: Number,
    	tvrage: Number
    },
    overview: String,
    first_aired: String,
    airs: {
    	day: String,
    	time: String,
    	timezone: String
    },
    runtime: Number,
    certification: String,
    network: String,
    country: String,
    trailer: String,
    homepage: String,
    status: String,
    rating: Number,
    votes: Number,
    language: String,
    available_translations: [String],
    genres: [String],
    aired_episodes: [String],
    images: {
    	fanart: {
    		full: String,
    		medium: String,
    		thumb: String
    	},
    	poster: {
    		full: String,
    		medium: String,
    		thumb: String
    	},
    	logo: {
    		full: String
		},
		clearart: {
			full: String
		},
		banner: {
			full: String
		},
		thumb: {
			full: String
		}
    }
});

var Show = mongoose.model('Show', ShowSchema);

module.exports = {
  Show: Show
}
