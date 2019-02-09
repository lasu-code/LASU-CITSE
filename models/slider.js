let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let sliderSchema = new Schema({
    name: { type: String },

    postImage: { type: String },

    text_on_img: {type: String},

    img_link: {type:String},

    img_link_text: {type: String},

    publicid: {type: String},

    is_visible: {
        type: Boolean,
        default: true
    },

    createdDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Slider", sliderSchema);
