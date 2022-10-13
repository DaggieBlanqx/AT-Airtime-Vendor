'use strict';
require('dotenv').config();
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
    cost: { type: Number },
    sentOn: { type: Date, default: new Date() },
    payload: { type: String },
    metadata: { type: Schema.Types.Mixed },
});

AirtimeSchema.plugin(aggregatePaginate);
AirtimeSchema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Mongoose.model('Airtime', AirtimeSchema);
