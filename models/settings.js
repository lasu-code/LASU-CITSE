let mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs")

let Schema = mongoose.Schema;


let settingsSchema = new Schema({
    siteLogo: {type: String},
    siteName: {type: String},
    tag: {type: String},
    createdDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Settings", settingsSchema)
