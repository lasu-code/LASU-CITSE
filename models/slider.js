let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let sliderSchema = new Schema({
    name: { type: String },

    postImage: { type: String },

    text_on_img: {type: String},

    img_link: {type:String},

    img_link_text: {type: String},

    is_visible: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model("Slider", sliderSchema)
