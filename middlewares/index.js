'use strict';
const signale = require('signale');
const jwt = require('jsonwebtoken');
const { validate, buildAndValidateSchema } = require('./validation.js');

const User = require('../controllers/User.js');
var _User = new User();

const preFetchAllUsers = async (req, res, next) => {
    try {
    } catch (e) {
        console.log(e);
        throw new Error('unexpected error');
        next();
    }
};

const authError = (input) => {
    var returnData = {
        status: 'Auth error',
        msg: 'Authentication error',
    };

    input?.msg ? (returnData['msg'] = input.msg) : null;
    return returnData;
};

const logTraffic = async (req, res, next) => {
    try {
        var trafficSource =
            req.headers['trafficsource'] || 'unknown or unspecified';

        signale.note(`Traffic source: ${trafficSource}`);
        req.trafficSource = trafficSource;

        next();
    } catch (e) {
        throw new Error('Bad error: in logTraffic middleware');
    }
};

const devEnvironmentServer_apiKey = async (req, res, next) => {
    try {
        const devAuthHeader = req.headers['devauth'] || Math.random();
        const devAuth = devAuthHeader.toString().trim();

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (Boolean(token) || Boolean(devAuth)) {
            if (devAuth && devAuth == process.env.DEV_AUTH_KEY) {
                signale.note(
                    'this request is being made by a dev server - static key'
                );
                next();
            } else if (token) {
                jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
                    if (err) {
                        signale.note(err);

                        return res.status(403).json(authError());
                    } else {
                        req.userId = user.payload.uid;
                        next(); // pass the execution off to whatever request the client intended
                    }
                });
            } else {
                // if there isn't any devAuth

                return res.status(403).json(authError());
            }
        } else {
            // if there isn't any devAuth

            return res.status(403).json(authError());
        }
    } catch (e) {
        signale.note(e);
        throw new Error('unexpected error');
        next();
    }
};

const nonstrict_authenticateJWTToken = async (req, res, next) => {
    // Bypass for now => because of Sequelize testing
    // next();

    try {
        // Gather the jwt access token from the request header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) {
            // if there isn't any token

            return res.status(403).json(authError());
        } else {
            jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
                if (err) {
                    signale.note(err);

                    return res.status(403).json(authError());
                } else {
                    req.userId = user.payload.uid;
                    next(); // pass the execution off to whatever request the client intended
                }
            });
        }
    } catch (e) {
        signale.note(e);
        throw new Error('unexpected error');
        next();
    }
};

// doesUserExist

const authenticateJWTToken = async (req, res, next) => {
    // Bypass for now => because of Sequelize testing
    // next();

    try {
        // Gather the jwt access token from the request header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) {
            // if there isn't any token

            return res.status(403).json(authError());
        } else {
            jwt.verify(token, process.env.TOKEN_SECRET, async (err, user) => {
                if (err) {
                    signale.note(err);

                    return res.status(403).json(authError());
                } else {
                    req.userId = user.payload.uid;
                    const existingUser = await User.doesUserExist(req.userId);

                    if (existingUser.status === 'successful') {
                        next(); // pass the execution off to whatever request the client intended
                    } else {
                        // return res.status(403).json(authError());
                        return res.status(403).json(
                            authError({
                                msg: 'User does not exist',
                            })
                        );
                    }
                }
            });
        }
    } catch (e) {
        signale.note(e);
        throw new Error('unexpected error');
        next();
    }
};

module.exports = {
    authenticateJWTToken,
    devEnvironmentServer_apiKey,
    logTraffic,
    validate,
    buildAndValidateSchema,
    nonstrict_authenticateJWTToken,
};
