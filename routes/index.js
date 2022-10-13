'use strict';
const express = require('express');
const { phone } = require('phone');
const {
    customerOnly,
    adminOnly,
    shouldNotBeLoggedIn,
    needsATcredentials,
} = require('../middlewares/index');
const router = express.Router();
// const { adminData, smsData, airtimeData } = require('../data_store/logs.json');

const adminData = [],
    smsData = [],
    airtimeData = [];

const Credential = require('../controllers/Credential.js');
const _Credential = new Credential();

const User = require('../controllers/User.js');
const _User = new User();

const {
    sendAirtime,
    doesFileExist,
    createBusinessOwnerFile,
    createAirtimeLogs,
    getAdminInfo,
} = require('../utils/index');
let analyticsAirtime = () => {
    // console.log(data);
    let dataResult = [];
    airtimeData.map((element) => {
        let fragData = element.responses;
        let numbSent = element.numSent;
        if (numbSent !== 0) {
            let result = fragData.map((el) => {
                let elem = { ...el };
                dataResult.push(elem);
            });
        } else {
            return {};
        }
    });
    return dataResult;
};

let analyticsSms = () => {
    // console.log(data);
    let dataResult = [];
    smsData.map((element) => {
        let fragData = element.responses;
        let numbSent = element.numSent;
        if (numbSent !== 0) {
            let result = fragData.map((el) => {
                let elem = { ...el };
                dataResult.push(elem);
            });
        } else {
            return {};
        }
    });
    return dataResult;
};

let analyticsAdmin = () => {
    // console.log(data);
    let dataResult = [];
    adminData.map((element) => {
        let fragData = element.responses;
        let numbSent = element.numSent;
        if (numbSent !== 0) {
            let result = fragData.map((el) => {
                let elem = { ...el };
                dataResult.push(elem);
            });
        } else {
            return {};
        }
    });
    return dataResult;
};

router.get('/', (req, res) => {
    const loggedInUser = req.session.user;
    if (loggedInUser) {
        return res.redirect('/airtime');
    } else {
        return res.render('pages/index', { warningMessage: null });
    }
});

router.use('/sign_out', (req, res) => {
    req.session.user = null;
    return res.redirect('/');
});

router.get('/signup', shouldNotBeLoggedIn, (req, res) =>
    res.render('pages/signup', { warningMessage: null })
);
router.get('/credentials', customerOnly, (req, res) =>
    res.render('pages/credentials', { warningMessage: null })
);
router.get('/airtime', customerOnly, needsATcredentials, (req, res) =>
    res.render('pages/airtime')
);
router.get('/sms', customerOnly, needsATcredentials, (req, res) =>
    res.render('pages/sms')
);
router.get('/admin', adminOnly, (req, res) =>
    res.render('pages/admin', {
        responseData: analyticsAdmin(),
    })
);
router.get('/aitimeAnalytics', customerOnly, (req, res) =>
    res.render('pages/airtimeAnalytics', {
        responseData: analyticsAirtime(),
    })
);
router.get('/smsAnalytics', customerOnly, (req, res) =>
    res.render('pages/smsAnalytics', {
        responseData: analyticsSms(),
    })
);

router.post('/sign_up', async (req, res) => {
    //receive Admin username and password -> then save it
    const country = req.body.country;
    const password = req.body.password;
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;
    const dataIn = {
        country,
        password,
        email,
        phoneNumber,
    };

    const output = await _User.create({ dataIn });

    if (output.status === 'success') {
        return res.redirect('/');
    } else {
        return res.render('pages/signup', {
            warningMessage: output.message || 'Oops! Unexpected error',
        });
    }
});

router.post('/sign_in', async (req, res) => {
    const incomingPassword = req.body.password;
    const email = req.body.email;
    const output = await _User.getByEmail({ email });
    if (output && output.status === 'success') {
        // good
        const { _id, isAdmin, userType, country, password } = output;
        if (password === incomingPassword) {
            req.session.user = {
                email,
                _id,
                isAdmin,
                userType,
                country,
                password,
            };
            return res.redirect('/');
        } else {
            return res.render('pages/index', {
                warningMessage: '🤥 Incorrect password!',
            });
        }
    } else {
        return res.render('pages/index', {
            warningMessage:
                '😱 Invalid email. You need to sign up if you do not have an account.',
        });
    }
});
/*
router.post('/add_at_credentials', async (req, res) => {
    console.log({ body: req.body})
    //receive API Keys and username
    const apiKey = req.body.apiKey;
    const username = req.body.username;

    const output = await createBusinessOwnerFile({
        apiKey,
        username,
    });

    console.log({ output });

    if (output.status === 'successful') {
        //good
        return res.redirect('/airtime');
        // return res.json({
        //     admin_username,
        //     admin_password,
        //     output,
        // });
    } else {
        //bad
        return res.status(500).json(output);
    }
});
*/

router.post('/add_at_credentials', customerOnly, async (req, res) => {
    //receive API Keys and username
    const apiKey = req.body.apiKey;
    const username = req.body.username;
    const userId = req.session.user._id;
    const dataIn = {
        apiKey,
        username,
        ownedBy: userId,
    };

    console.log({ dataIn });

    const output = await _Credential.create(dataIn);

    console.log({ output });

    if (output.status === 'success') {
        //good
        return res.redirect('/airtime');
    } else {
        //bad
        return res.status(500).json(output);
    }
});
router.post('/send_airtime', async (req, res) => {
    try {
        //receive phone numbers and amount
        let errors = [];
        let phoneNumbers = [];

        let _phoneNumbers = req.body.phoneNumbers;
        let amount = req.body.amount;

        let recipients = _phoneNumbers?.split(',');

        recipients.map((rp) => {
            let phoneRegex = /^(\+[1-9]{1,3})?\d{4,}$/;

            if (phoneRegex.test(rp)) {
                phoneNumbers.push(rp);
            } else {
                errors.push(`Invalid phone: ${rp}`);
            }
        });

        if (errors.length) {
            return res.json({
                errors,
            });
        }

        const airtimeResult = await sendAirtime({ phoneNumbers, amount });
        if (airtimeResult.status === 'successful') {
            // write to file
            console.log({ airtimeResult });
            let output = await createAirtimeLogs({
                singleTransaction: airtimeResult.result,
            });

            if (output.status === 'successful') {
                return res.redirect('/analytics');
            } else {
                console.log({ output });
                return res.redirect('/analytics');
                return res.json(output);
            }
        } else {
            return res.status(500).json({
                ...airtimeResult,
            });
        }
    } catch (err) {
        return res.status(500).json({
            ...err,
        });
    }
});

router.get('/sales', (req, res) => {
    res.json({
        status: 'succcessful',
        data: {},
    });
});

/***
 * IGNORE BELOW ROUTES FOR NOW:
 */

router.post('/sign_up_2', async (req, res) => {
    //receive Admin username and password -> then save it
    const country = req.body.country;
    const password = req.body.password;
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;
    const dataIn = {
        country,
        password,
        email,
        phoneNumber,
    };

    const output = await _User.create({ dataIn });

    if (output.status === 'successful') {
        req.session.user = {
            admin_username,
        };
        // good
        res.json(output);
        // return res.redirect('/Credential');
    } else {
        //bad
        return res.status(500).json(output);
    }
});

router.post('/sign_in_2', async (req, res) => {
    const password = req.body.password;
    const email = req.body.email;

    const output = await _User.getByEmail({ email });

    if (output.status === 'successful') {
        req.session.user = {
            admin_username,
        };
        // good
        res.json(output);
        // return res.redirect('/Credential');
    } else {
        //bad
        return res.status(500).json(output);
    }
});

router.post('/add_at_credential_2', async (req, res) => {
    //receive API Keys and username
    const apiKey = req.body.apiKey;
    const username = req.body.username;

    const output = await _Credential.create({
        apiKey,
        username,
    });

    console.log({ output });

    if (output.status === 'success') {
        //good
        return res.json(output);
        // return res.redirect('/airtime');
    } else {
        //bad
        return res.status(500).json(output);
    }
});

router.post('/send_airtime_2', async (req, res) => {
    try {
        //receive phone numbers and amount
        let errors = [];
        let phoneNumbers = [];

        let _phoneNumbers = req.body.phoneNumbers;
        let amount = req.body.amount;

        let recipients = _phoneNumbers?.split(',');

        recipients.map((rp) => {
            let phoneRegex = /^(\+[1-9]{1,3})?\d{4,}$/;

            if (phoneRegex.test(rp)) {
                phoneNumbers.push(rp);
            } else {
                errors.push(`Invalid phone: ${rp}`);
            }
        });

        if (errors.length) {
            return res.json({
                errors,
            });
        }

        const airtimeResult = await sendAirtime({ phoneNumbers, amount });
        if (airtimeResult.status === 'successful') {
            // write to file
            console.log({ airtimeResult });
            let output = await createAirtimeLogs({
                singleTransaction: airtimeResult.result,
            });

            if (output.status === 'successful') {
                return res.redirect('/analytics');
            } else {
                console.log({ output });
                return res.redirect('/analytics');
                return res.json(output);
            }
        } else {
            return res.status(500).json({
                ...airtimeResult,
            });
        }
    } catch (err) {
        return res.status(500).json({
            ...err,
        });
    }
});
module.exports = router;
