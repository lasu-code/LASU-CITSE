let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let messageSchema = new Schema({
    name : {type: String},
    email: {type: String},
    subject: {type: String},
    message: {type: String},
    createdDate: {
        type: Date,
        date: Date.now()
    }
});


module.exports = mongoose.model("message", messageSchema)