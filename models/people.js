let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let peopleSchema = new Schema({
    name: { type: String },
    postImage: { type: String },
    publicid: { type: String },
    work_at: { type: String },
    position: { type: String },
    email: { type: String },
    phone: { type: String },
    work_info_1: { type: String },
    work_info_2: { type: String },
    work_info_3: { type: String },
    tag: { type: String },
    is_active: { type: String, default: true },
    createdDate: { type: Date, default: Date.now }
})

module.exports = mongoose.model("People", peopleSchema);