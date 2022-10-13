'use strict';

const _Credential = require('../models/Credential.js');

var Credential = function () {
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

Credential.prototype.create = function (dataIn) {
    return new Promise((resolve, reject) => {
        if (!dataIn) {
            reject(errNoInfo());
        } else {
            Object.keys(dataIn).map((i) => {
                this[i] = dataIn[i];
            });

            var __Credential = new _Credential(this);

            __Credential.save((err, docs) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        status: 'success',
                        Credential: docs,
                    });
                }
            });
        }
    });
};

Credential.prototype.getById = function (CredentialId) {
    return new Promise((resolve, reject) => {
        _Credential.findById(CredentialId, (err, docs) => {
            err ? reject(err) : resolve(docs);
        });
    });
};

Credential.prototype.getAll = function () {
    return new Promise((resolve, reject) => {
        _Credential.find({}, (err, docs) => {
            err ? reject(err) : resolve(docs);
        });
    });
};

module.exports = Credential;
