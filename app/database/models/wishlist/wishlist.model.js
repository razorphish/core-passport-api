const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Preference = require('./wishlist-preference.model');

const WishlistSchema = new Schema({
    name: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, trim: true },
    preferences: { type: Preference.schema, required: true },
    statusId: {
        type: String, 
        required: true, 
        enum: ['active', 'inactive', 'disabled', 'pending', 'archived', 'suspended', 'deleted'],
        default: 'active'
    },
    Privacy: {
        type: String, 
        required: true, 
        enum: ['Private', 'Public'],
        default: 'Public'
    },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

WishlistSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('Wishlist', WishlistSchema, 'wishlist');
