'use strict';
const express = require('express');
const router = express.Router();

const {
    sendAirtime,
    doesFileExist,
    writeToFile,
    createBusinessOwnerFile,
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

    let xyz = await writeToFile({
        data: {
            username: 'daggie',
            apiKey: 'abcd',
            password: 12434,
        },
        filePath: developmentJSONFile,
    });

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
module.exports = router;
