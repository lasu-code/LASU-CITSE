let mongoose = require('mongoose');

let Schema= mongoose.Schema;

let sponsorSchema = new Schema({
    name: { type: String },

    postImage: { type: String },

    text_on_img: {type: String},

    CreatedDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("sponsor", {sponsorSchema})