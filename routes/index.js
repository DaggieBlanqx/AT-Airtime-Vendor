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

router.get('/send/:amount/:phoneNumber', async (req, res) => {
    let phoneNumber = req.params.phoneNumber;
    let amount = req.params.amount;

    const outcome = await sendAirtime({
        phoneNumber,
        amount,
    });

    res.json({ outcome, amount, phoneNumber });
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
