'use strict';

const _Sms = require('../models/Sms.js');

var Sms = function () {
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

Sms.prototype.create = function (dataIn) {
    return new Promise((resolve, reject) => {
        if (!dataIn) {
            reject(errNoInfo());
        } else {
            Object.keys(dataIn).map((i) => {
                this[i] = dataIn[i];
            });

            var __Sms = new _Sms(this);

            __Sms.save((err, docs) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        status: 'success',
                        Sms: docs,
                    });
                }
            });
        }
    });
};

Sms.prototype.getById = function ({ SmsId }) {
    return new Promise((resolve, reject) => {
        _Sms.findById(SmsId, (err, docs) => {
            err ? reject(err) : resolve(docs);
        });
    });
};

Sms.prototype.getAll = function () {
    return new Promise((resolve, reject) => {
        _Sms.find({}, (err, docs) => {
            err ? reject(err) : resolve(docs);
        });
    });
};

module.exports = Sms;
