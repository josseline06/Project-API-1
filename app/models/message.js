var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new Schema({

	date: Date,

	content : String,

	owner : String,

	attachment : {
		type_attachment : String,
		src : String
	},


	chat : {
		type : Schema.Types.ObjectId,
		ref : 'Chat'
	}

},{

toObject: {
		virtuals: true
	}, toJSON: {
		virtuals: true
	}
});


module.exports = mongoose.model('Message', MessageSchema);