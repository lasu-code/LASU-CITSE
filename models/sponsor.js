let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let sponsorSchema = new Schema({
    name: { type: String },

    postImage: { type: String },

    text_on_img: {type: String},

    publicid: {type: String},

})

module.exports = mongoose.model("Sponsor", sponsorSchema)
