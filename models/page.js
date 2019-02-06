let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let PageSchema = new Schema({
    tag: {
        type: String
    },
    name: {
        type: String
    },
    summary: {
        type: String
    },
    content: {
        type: String
    },
    postImage: {
        type: String
    },
    postImageCaption: {
        type: String
    },
    meta_key: {
        type: String
    },
    meta_desc: {
        type: String
    },
    is_active: {
        type: Boolean,
        default: true
    },
    publicid: {
        type: String
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Page", PageSchema)