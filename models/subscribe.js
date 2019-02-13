let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let subscribeSchema = new Schema({
    email: {type: String},
    createdDate: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("Subscriber", subscribeSchema);
