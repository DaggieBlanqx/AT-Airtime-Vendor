'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const timestamps = require('mongoose-timestamp');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const AirtimeSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
    },
    amount: { type: String },
    discount: { type: String },
    phoneNumber: { type: String },
    requestId: { type: String },
    status: { type: String },
    sentOn: { type: Date, default: new Date() },
    metadata: { type: Schema.Types.Mixed },
});

AirtimeSchema.plugin(aggregatePaginate);
AirtimeSchema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Mongoose.model('Airtime', AirtimeSchema);
