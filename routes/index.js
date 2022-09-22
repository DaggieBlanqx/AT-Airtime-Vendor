'use strict';
const express = require('express');
const router = express.Router();
const data = require('../data_store/logs.json');

const {
    sendAirtime,
    doesFileExist,
    createBusinessOwnerFile,
} = require('../utils/index');
let analyticsInfo = ()=> {
    // console.log(data);
    let dataResult = [];
    data.map(element => {
        let fragData = element.responses;
        let numbSent = element.numSent;
        if( numbSent !== 0) {

            let result = fragData.map((el) => {
                let elem = {...el}
                dataResult.push(elem);
            });
            
        } else {
            return {};
        }
    });
    return dataResult;
}
router.get('/', (req, res) => res.render('pages/index'));
router.get('/credentials', (req, res) => res.render('pages/credentials'));
router.get('/airtime', (req, res) => res.render('pages/airtime'));
router.get('/analytics', (req, res) => res.render('pages/analytics', {
    responseData: analyticsInfo(),
}));

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
module.exports = router;
