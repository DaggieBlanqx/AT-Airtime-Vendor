'use strict';

const _User = require('../models/User.js');

var User = function () {
    this.available = true;
};

var errNotFound = function ({ err, msg }) {
    return {
        err: err || null,
        msg: msg || 'Not found',
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
                    const errMessage = err.message;
                    if (
                        errMessage.includes('email') &&
                        errMessage.includes('unique')
                    ) {
                        resolve({
                            status: 'failed',
                            message:
                                'Email already registered! Sign in with it, or contact admin',
                        });
                    } else {
                        reject({
                            status: 'failed',
                            ...err,
                        });
                    }
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
            if (err) {
                reject(err);
            } else {
                if (docs) {
                    resolve({
                        status: 'success',
                        ...docs._doc,
                    });
                } else {
                    resolve({
                        status: 'failed',
                        msg: 'Email not found',
                    });
                }
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
            err
                ? reject(err)
                : resolve({
                      status: 'success',
                      data: docs,
                  });
        });
    });
};

module.exports = User;
