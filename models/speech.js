let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let speechSchema = new Schema({
    name: { type: String },

    postImage: { type: String },

    text_on_img: {type: String},

    const: {type: String},

    publicid: {type: String},
});

module.exports = mongoose.model("Speech", speechSchema);
