let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let newsSchema = new Schema({
    title: { type: String },
    newsImage: { type: String },
    publicid : {type: String},
    author: { type: String },
    summary: { type: String },
    content: { type: String },
    tags: { type: String },
    meta_keyword: {type: String},
    meta_desc: {type: String},
    is_visible: {
        type: Boolean,
        default: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("News", newsSchema);