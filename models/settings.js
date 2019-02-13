let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let settingsSchema = new Schema({
    name: {type: String},
    value: {type: String},
    createdDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Settings", settingsSchema);
