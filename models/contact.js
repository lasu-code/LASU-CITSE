let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let ContactSchema = new Schema({
    address: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    mapLongitude: {
        type: String
    },
    mapLatitude: {
        type: String
    },
    is_active: {
        type: Boolean,
        default: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Contact", ContactSchema);