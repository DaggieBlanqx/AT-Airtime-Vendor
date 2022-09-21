'use strict';
const express = require('express');
const router = express.Router();

const {
    sendAirtime,
    doesFileExist,
    createBusinessOwnerFile,
    createAirtimeLogs,
} = require('../utils/index');

router.get('/', (req, res) => res.render('pages/index'));

router.post('/sign_up', async (req, res) => {
    //receive Admin username and password -> then save it
    const admin_username = req.body.admin_username;
    const admin_password = req.body.admin_password;

    const output = await createBusinessOwnerFile({
        admin_username,
        admin_password,
    });

    if (output.status === 'successful') {
        req.session.user = {
            admin_username,
        };
        // good
        res.json({
            admin_username,
            admin_password,
            output,
        });
    } else {
        //bad
        res.status(500).json(output);
    }
});

router.post('/sign_in', (req, res) => {
    //receive Admin username and password
    const admin_username = req.body.admin_username;
    const admin_password = req.body.admin_password;

    console.log();
});

router.post('/add_at_credentials', (req, res) => {
    //receive API Keys and username
});

router.post('/send_airtime', (req, res) => {
    //receive phone numbers and amount
});

router.get('/send/:amount/:phoneNumber', async (req, res) => {
    try {
        let phoneNumber = req.params.phoneNumber;
        let amount = req.params.amount;

        const outcome = await sendAirtime({
            phoneNumber,
            amount,
        });

        if (outcome.status === 'successful') {
            res.json({ ...outcome });
        } else {
            res.json({ ...outcome });
        }
    } catch (err) {
        res.json({ err });
    }
    // res.json({ outcome, amount, phoneNumber });
});

router.get('/test', async (req, res) => {
    let developmentJSONFile = `${process.cwd()}/config/test.json`;

    let xyz = await {
        data: {
            username: 'daggie',
            apiKey: 'abcd',
            password: 12434,
        },
        filePath: developmentJSONFile,
    };

    res.json({
        developmentJSONFile,
        doesFileExist: doesFileExist({ filePath: developmentJSONFile, xyz }),
    });
});

router.get('/prod', async (req, res) => {
    let output = await createBusinessOwnerFile({
        apiKey: 'qwhjdhhd',
        username: 'kjskjkd',
        password: 12445,
    });

    res.json({
        output,
    });
});

router.get('/fin', async (req, res) => {
    let output = await createAirtimeLogs({
        singleTransaction: {
            errorMessage: 'None',
            numSent: 1,
            responses: [
                {
                    amount: 'KES 5.0000',
                    discount: 'KES 0.2000',
                    errorMessage: 'None',
                    phoneNumber: '+254705212848',
                    requestId: 'ATQid_78b2a8f5a1efe40a08f61993db96bf71',
                    status: 'Sent',
                },
            ],
            totalAmount: 'KES 10.0000',
            totalDiscount: 'KES 0.4000',
        },
    });

    res.json({
        output,
    });
});

module.exports = router;
