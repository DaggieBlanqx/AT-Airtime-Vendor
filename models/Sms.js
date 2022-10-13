'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const timestamps = require('mongoose-timestamp');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const SmsSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
    },
    cost: { type: String },
    messageId: { type: String },
    status: { type: String },
    sentOn: { type: Date, default: new Date() },
    message: { type: String },
    phoneNumber: { type: String },
    metadata: { type: Schema.Types.Mixed },
});

SmsSchema.plugin(aggregatePaginate);
SmsSchema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Mongoose.model('SMS', SmsSchema);
