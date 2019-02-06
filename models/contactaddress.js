let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let mailSchema = new Schema({
    email: {type: String},
});

module.exports = mongoose.model('mail', mailSchema)