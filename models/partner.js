let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let partnerSchema = new Schema({
    name: { type: String },

    postImage: { type: String },

    content: {type: String},

    publicid: {type: String},
})

module.exports = mongoose.model("Partner", partnerSchema)
