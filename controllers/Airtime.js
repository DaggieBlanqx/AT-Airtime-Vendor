'use strict';

const _Airtime = require('../models/Airtime.js');

var Airtime = function () {
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

Airtime.prototype.create = function (dataIn) {
    return new Promise((resolve, reject) => {
        if (!dataIn) {
            reject(errNoInfo());
        } else {
            Object.keys(dataIn).map((i) => {
                this[i] = dataIn[i];
            });

            var __Airtime = new _Airtime(this);

            __Airtime.save((err, docs) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        status: 'success',
                        Airtime: docs,
                    });
                }
            });
        }
    });
};

Airtime.prototype.getById = function ({ AirtimeId }) {
    return new Promise((resolve, reject) => {
        _Airtime.findById(AirtimeId, (err, docs) => {
            err ? reject(err) : resolve(docs);
        });
    });
};

Airtime.prototype.getAll = function () {
    return new Promise((resolve, reject) => {
        _Airtime.find({}, (err, docs) => {
            err
                ? reject(err)
                : resolve({
                      status: 'success',
                      data: docs,
                  });
        });
    });
};

Airtime.prototype.getAll_Detailed = function () {
    return new Promise((resolve, reject) => {
        _Airtime
            .find({})
            .populate('user')
            .exec(function (err, docs) {
                if (err) {
                    reject({ ...err });
                } else {
                    resolve({
                        status: 'success',
                        data: docs,
                    });
                }
                // do something
            });
    });
};

module.exports = Airtime;
