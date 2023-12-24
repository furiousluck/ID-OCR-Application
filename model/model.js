var mongoose = require('mongoose');
var imgschema = new mongoose.Schema({
    desc: String,
    img: {
        data: Buffer,
        contentType: String
    }
});

module.exports = mongoose.model("Image", imgschema);