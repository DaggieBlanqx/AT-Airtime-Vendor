'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const timestamps = require('mongoose-timestamp');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new Schema({
    credential: {
        type: ObjectId,
        ref: 'Credential',
    },
    country: { type: String },
    phoneNumber: { type: String },
    email: {
        type: String,
        require: true,
        unique: true,
        uniqueCaseInsensitive: true,
    },
    allowedToLogin: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    currentUserRole: { type: String, default: 'normal' },
    password: { type: String },
    forgotPasswordCode: { type: String },
    agreedToTandCandP: { type: Boolean, default: true },
    userType: { type: String, default: 'normal' }, //admin vs normal
});

UserSchema.plugin(aggregatePaginate);
UserSchema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

UserSchema.plugin(uniqueValidator);

module.exports = Mongoose.model('User', UserSchema);
