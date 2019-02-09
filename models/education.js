let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let educationSchema = new Schema({
    newImg: { type: String },
    content: { type: String },
    name: {type: String},
    createdDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Eduction", educationSchema);