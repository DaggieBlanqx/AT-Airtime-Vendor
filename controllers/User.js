'use strict';

const _User = require('../models/User.js');

var User = function () {
    this.available = true;
};

var errNotFound = function (e) {
    return {
        err: e,
        msg: 'Not found',
    };
};

var errNoInfo = function (e) {
    return {
        result: 'error',
        msg: 'no info',
        e: e || null,
    };
};

User.prototype.create = function ({ dataIn }) {
    return new Promise((resolve, reject) => {
        if (!dataIn) {
            reject(errNoInfo());
        } else {
            Object.keys(dataIn).map((i) => {
                this[i] = dataIn[i];
            });

            var __User = new _User(this);

            __User.save((err, docs) => {
                if (err) {
                    reject({
                        status: 'failed',
                        ...err,
                    });
                } else {
                    resolve({
                        status: 'success',
                        User: docs,
                    });
                }
            });
        }
    });
};

User.prototype.getById = function ({ UserId }) {
    return new Promise((resolve, reject) => {
        _User.findById(UserId, (err, docs) => {
            err ? reject(err) : resolve(docs);
        });
    });
};

User.prototype.getByEmail = function ({ email }) {
    return new Promise((resolve, reject) => {
        _User.findOne({ email: email }, function (err, docs) {
            console.log({ err, docs });
            if (err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
};

User.prototype.getByPhoneNumber = function ({ phoneNumber }) {
    return new Promise((resolve, reject) => {
        _User.findOne({ phoneNumber: phoneNumber }, function (err, docs) {
            if (err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
};

User.prototype.getAll = function () {
    return new Promise((resolve, reject) => {
        _User.find({}, (err, docs) => {
            err ? reject(err) : resolve(docs);
        });
    });
};

module.exports = User;
