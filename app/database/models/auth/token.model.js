/** */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  loginProvider: { type: String, required: true },
  name: { type: String, required: true },
  value: { type: String, required: true },
  scope: { type: String, required: true },
  type: { type: String, required: true},
  expiresIn: { type: Number, required: true },
  dateExpire: { type: Date, required: false },
  dateCreated: { type: Date, required: true, default: Date.now }
});

//Compound index
//TokenSchema.index({ userId: 1, loginProvider: 1, name: 1 });

module.exports = mongoose.model('Token', TokenSchema, 'tokens');