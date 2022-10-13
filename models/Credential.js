'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const CredentialSchema = new Schema({
    username: String,
    apiKey: String,
});

module.exports = Mongoose.model('Credential', CredentialSchema);
