var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChatSchema = new Schema({

	user1: {
		type: String,
		unique: true,
		required: true
	},

	user2: {
		type: String,
		unique: true,
		required: true
	},

	messages: [{
		type : Schema.Types.ObjectId,
		ref : 'Message'
	}],

	isActive: Boolean


},{

toObject: {
		virtuals: true
	}, toJSON: {
		virtuals: true
	}
});

module.exports = mongoose.model('Chat', ChatSchema);