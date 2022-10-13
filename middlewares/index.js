'use strict';
const signale = require('signale');
const { validate, buildAndValidateSchema } = require('./validation.js');

const User = require('../controllers/User.js');
var _User = new User();
const Credential = require('../controllers/Credential.js');
const _Credential = new Credential();

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

const adminOnly = async (req, res, next) => {
    const loggedInUser = req.session.user;
    if (loggedInUser && loggedInUser.isAdmin) {
        next();
    } else {
        req.session.user = null;
        return res.render('pages/index', {
            warningMessage:
                'Sorry! You are not an admin, you cannot access this resource!',
        });
    }
};

const customerOnly = async (req, res, next) => {
    const loggedInUser = req.session.user;
    if (loggedInUser) {
        next();
    } else {
        return res.redirect('/');
    }
};

const shouldNotBeLoggedIn = async (req, res, next) => {
    const loggedInUser = req.session.user;
    if (loggedInUser) {
        return res.redirect('/');
    } else {
        next();
    }
};

const needsATcredentials = async (req, res, next) => {
    const loggedInUser = req.session.user;
    if (loggedInUser) {
        const output = await _Credential.getByOwner({
            ownedBy: loggedInUser._id,
        });

        if (output.status === 'success') {
            next();
        } else {
            return res.render('pages/credentials', {
                warningMessage: `You need to set your Africa's Talking API keys first!`,
            });
        }
    } else {
        return res.render('pages/credentials', {
            warningMessage: `You need to set your Africa's Talking API keys first!`,
        });
    }
};

module.exports = {
    logTraffic,
    validate,
    buildAndValidateSchema,
    customerOnly,
    adminOnly,
    shouldNotBeLoggedIn,
    needsATcredentials,
};
