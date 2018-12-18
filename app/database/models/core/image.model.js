const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    data: { type: Buffer, required: true },
    contentType: { type: String }, //image/pneg
    mimeType: { type: String }, //.png
    fileName: { type: String }, //image.png
    fileOwner: { type: string },
    sortOrder: { type: Number, default: 0 },
    dateCreated: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Image', ImageSchema, 'images');

