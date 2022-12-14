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

const adminData = [],
    smsData = [],
    airtimeData = [];

const Credential = require('../controllers/Credential.js');
const _Credential = new Credential();

const User = require('../controllers/User.js');
const _User = new User();

const Airtime = require('../controllers/Airtime.js');
const _Airtime = new Airtime();

const Sms = require('../controllers/Sms.js');
const _Sms = new Sms();

const {
    sendAirtime,
    doesFileExist,
    createBusinessOwnerFile,
    createAirtimeLogs,
    getAdminInfo,
    sendSMS,
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
router.get('/credentials', customerOnly, async (req, res) => {
    const loggedInUser = req.session.user;
    if (loggedInUser) {
        const output = await _Credential.getByOwner({
            ownedBy: loggedInUser._id,
        });
        if (output.status === 'success') {
            res.render('pages/credentials', {
                warningMessage: null,
                overwriteMessage:
                    'You have already set your apiKey and username. By submiting this form, you will be overwritting your previous settings.',
            });
        }
    }

    return res.render('pages/credentials', {
        warningMessage: null,
        overwriteMessage: null,
    });
});
router.get('/airtime', customerOnly, needsATcredentials, (req, res) =>
    res.render('pages/airtime', { warningMessage: null })
);
router.get('/sms', customerOnly, needsATcredentials, (req, res) =>
    res.render('pages/sms')
);

router.get('/_admin', adminOnly, async (req, res) => {
    let errors = [];
    const allSMS = await _Sms.getAll();

    if (allSMS.status === 'success') {
    } else {
        errors.push({ msg: '' });
    }
});

router.get('/admin', adminOnly, async (req, res) => {
    // return    res.render('pages/admin',{responseData:[]})

    const partitionedSMS = {};
    const partitionedAirtime = {};
    const errors = [];

    const combined = {};

    const allSMS = await _Sms.getAll_Detailed();
    const allAirtime = await _Airtime.getAll_Detailed();

    if (allSMS.status === 'success') {
        allSMS.data.map((d) => {
            let _userId = d.user._id.toString();
            let newSMS = {
                ...d._doc,
                cost: d.cost,
            };

            if (partitionedSMS[_userId]) {
                partitionedSMS[_userId] = [...partitionedSMS[_userId], newSMS];
            } else {
                partitionedSMS[_userId] = [newSMS];
            }
        });
    } else {
        errors.push({
            msg: 'Could not get the SMSes',
        });
    }

    if (allAirtime.status === 'success') {
        allAirtime.data.map((d) => {
            let _userId = d.user._id.toString();
            let newAirtime = {
                amount: d.amount,
                ...d._doc,
            };

            if (partitionedAirtime[_userId]) {
                partitionedAirtime[_userId] = [
                    ...partitionedAirtime[_userId],
                    newAirtime,
                ];
            } else {
                partitionedAirtime[_userId] = [newAirtime];
            }
        });
    } else {
        errors.push({
            msg: 'Could not get the Airtime list',
        });
    }
    // Number(t.split(" ")[1])
    /*
    Object.keys(partitionedSMS).map((p) => {
        let currency = '';
        let sms_items = Object.values(partitionedSMS[p]);
    
        let numberOfSMS = sms_items.length;
        let cost = sms_items
            .map((_item) => {
                currency = _item.cost.split(' ')[0];
    
                // Id	Phone Number	email	Country	Sms	Airtime
    
                return Number(_item.cost.split(' ')[1]);
            })
            .reduce((a, b) => a + b);
        let user = sms_items[0].user;
        console.log({ p, cost, user, numberOfSMS });
        // console.log({p:})
    });
    */

    Object.keys(partitionedSMS).map((p) => {
        let currency = '';
        let sms_items = Object.values(partitionedSMS[p]);
        let airtime_items = Object.values(partitionedAirtime[p]);

        let numberOfSMS = sms_items.length;
        let numberOfAirtime = airtime_items.length;

        let sms_cost = sms_items
            .map((_item) => {
                currency = _item.cost.split(' ')[0];

                // Id	Phone Number	email	Country	Sms	Airtime

                return Number(_item.cost.split(' ')[1]);
            })
            .reduce((a, b) => a + b);

        let airtime_cost = airtime_items
            .map((_item) => {
                currency = _item.amount.split(' ')[0];

                // Id	Phone Number	email	Country	Sms	Airtime

                return Number(_item.amount.split(' ')[1]);
            })
            .reduce((a, b) => a + b);

        let user = sms_items[0].user;
        console.log({
            p,
            sms_cost,
            user,
            numberOfSMS,
            numberOfAirtime,
            airtime_cost,
        });
        // console.log({p:})
    });

    res.json({
        partitionedSMS,
        partitionedAirtime,
    });
});

router.get('/aitimeAnalytics', customerOnly, async (req, res) => {
    var dataOut = [];

    const airtimeAnalytics = await _Airtime.getAll();

    if (airtimeAnalytics.status === 'success') {
        dataOut = airtimeAnalytics.data;
    }

    res.render('pages/airtimeAnalytics', {
        responseData: dataOut,
    });
});

router.get('/smsAnalytics', customerOnly, async (req, res) => {
    // const smsAnalytics = await _Sms.getAll();
    // res.render('pages/smsAnalytics', {
    //     responseData: smsAnalytics,
    // });

    var dataOut = [];

    const smsAnalytics = await _Sms.getAll();

    if (smsAnalytics.status === 'success') {
        dataOut = smsAnalytics.data;
    }

    res.render('pages/smsAnalytics', {
        responseData: dataOut,
    });
});

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
                warningMessage: '???? Incorrect password!',
            });
        }
    } else {
        return res.render('pages/index', {
            warningMessage:
                '???? Invalid email. You need to sign up if you do not have an account.',
        });
    }
});
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

    const output = await _Credential.update({ dataIn });

    if (output.status === 'success') {
        //good
        return res.redirect('/airtime');
    } else {
        //bad
        return res.render('pages/credentials', {
            warningMessage: 'Oops! An issue occurred!',
            overwriteMessage: null,
        });
    }
});
router.post(
    '/send_airtime',
    customerOnly,
    needsATcredentials,
    async (req, res) => {
        try {
            //receive phone numbers and amount
            let errors = [];
            let phoneNumbers = [];

            let _phoneNumbers = req.body.phoneNumbers;
            let amount = req.body.amount;
            const userId = req.session.user._id;

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
            const output = await _Credential.getByOwner({
                ownedBy: req.session.user._id,
            });

            console.log({ output });

            const username = output.username;
            const apiKey = output.apiKey;

            const airtimeResult = await sendAirtime({
                apiKey,
                username,
                phoneNumbers,
                amount,
            });
            if (airtimeResult.status === 'successful') {
                // write to file
                console.log({ airtimeResult });

                let allResponses = airtimeResult.result.responses || [];

                const bulkDataIn = allResponses.map((rsp) => {
                    let dataIn = {
                        ...rsp,
                        user: userId,
                        metadata: rsp,
                    };
                    return _Airtime.create(dataIn);
                });

                return Promise.all(bulkDataIn)
                    .then((dataOut) => {
                        res.redirect('/aitimeAnalytics');
                    })
                    .catch((dataOutError) => {
                        console.error({ dataOutError });

                        res.redirect('/aitimeAnalytics');
                    });
            } else {
                console.log({ 'bad airtimeResult': airtimeResult });
                return res.render('pages/airtime', {
                    warningMessage:
                        'Unfortunately, we could not complete this request!',
                });
            }
        } catch (err) {
            if (err.message && err.message.includes('duplicate')) {
                return res.render('pages/airtime', {
                    warningMessage:
                        '????Take a 5minute break! You have just sent a similar amount to the same recipient(s). ',
                });
            } else {
                return res.render('pages/airtime', {
                    warningMessage:
                        err.message || 'Oops! We did not see this coming',
                });
            }
        }
    }
);

router.post('/send_sms', customerOnly, needsATcredentials, async (req, res) => {
    try {
        //receive phone numbers and amount
        let errors = [];
        let phoneNumbers = [];

        let _phoneNumbers = req.body.phoneNumbers;
        let message = req.body.message;
        const userId = req.session.user._id;

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
        const output = await _Credential.getByOwner({
            ownedBy: req.session.user._id,
        });

        console.log({ output });

        const username = output.username;
        const apiKey = output.apiKey;

        const smsResult = await sendSMS({
            apiKey,
            username,
            phoneNumbers,
            message,
        });
        if (smsResult.status === 'successful') {
            // write to file
            console.log({ smsResult });

            const bulkDataIn = smsResult.listOfRecipients.map((rsp) => {
                let dataIn = {
                    ...rsp,
                    user: userId,
                    metadata: rsp,
                    phoneNumber: rsp.number,
                };
                return _Sms.create(dataIn);
            });

            return Promise.all(bulkDataIn)
                .then((dataOut) => {
                    return res.redirect('/smsAnalytics');
                })
                .catch((dataOutError) => {
                    console.error({ dataOutError });
                    return res.redirect('/smsAnalytics');
                });
        } else {
            console.log({ 'bad smsResult': smsResult });
            return res.render('pages/sms', {
                warningMessage:
                    'Unfortunately, we could not complete this request!',
            });
        }
    } catch (err) {
        if (err.message && err.message.includes('duplicate')) {
            return res.render('pages/sms', {
                warningMessage:
                    '????Take a 5minute break! You have just sent a similar message to the same recipient(s). ',
            });
        } else {
            return res.render('pages/sms', {
                warningMessage:
                    err.message || 'Oops! We did not see this coming',
            });
        }
    }
});

module.exports = router;
