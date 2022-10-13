'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CredentialSchema = new Schema({
    username: { type: String },
    apiKey: { type: String },
    ownedBy: {
        type: ObjectId,
        ref: 'User',
    },
});

module.exports = Mongoose.model('Credential', CredentialSchema);
