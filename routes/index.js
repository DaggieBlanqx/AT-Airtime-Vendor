'use strict';
const express = require('express');
const { phone } = require('phone');

const router = express.Router();
const data = require('../data_store/logs.json');

const {
    sendAirtime,
    doesFileExist,
    createBusinessOwnerFile,
    createAirtimeLogs,
    getAdminInfo,
} = require('../utils/index');
let analyticsInfo = () => {
    // console.log(data);
    let finalData = data.map((element) => {
        let fragData = element.responses;
        // console.log('fragdata', fragData);
        let result = fragData.map((el) => {
            console.log('element', el);
            let elem = { ...el };
            return elem;
        });
        console.log('result', result);
        // console,log('amaount', fragData.amount);
        // let result = [...fragData];
        return result;
    });
    // console.log('responses',...finalData);
    // console.log('json', JSON.stringify(finalData))
};
router.get('/', (req, res) => res.render('pages/index'));
router.get('/credentials', (req, res) => res.render('pages/credentials'));
router.get('/airtime', (req, res) => res.render('pages/airtime'));
router.get('/analytics', (req, res) =>
    res.render('pages/analytics', {
        responseData: analyticsInfo(),
    })
);

router.post('/sign_up', async (req, res) => {
    //receive Admin username and password -> then save it
    const admin_username = req.body.admin_username;
    const admin_password = req.body.admin_password;

    const output = await createBusinessOwnerFile({
        admin_username,
        admin_password,
    });

    if (output.status === 'successful') {
        res.redirect('/credentials');
        req.session.user = {
            admin_username,
        };
        // good
        return res.json({
            admin_username,
            admin_password,
            output,
        });
    } else {
        //bad
        return res.status(500).json(output);
    }
});

router.post('/sign_in', async (req, res) => {
    //receive Admin username and password
    const admin_username = req.body.admin_username;
    const admin_password = req.body.admin_password;

    if (!admin_password || !admin_username) {
        return res.status(400).json({
            status: 'failed',
            message: 'Invalid username or password',
        });
    }

    let data = await getAdminInfo();

    return res.json({
        admin_username,
        admin_password,
        data,
    });
});

router.post('/add_at_credentials', async (req, res) => {
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

router.post('/send_airtime', async (req, res) => {
    //receive phone numbers and amount
    let errors = [];
    let phoneNumbers = [];

    let _phoneNumbers = req.body.phoneNumbers;
    let amount = req.body.amount;

    let recipients = _phoneNumbers?.split(',');

    recipients.map((rp) => {
        let phoneRegex = /^(\+[1-9]{1,3})?\d{4,}$/

        if(phoneRegex.test(rp)){
            phoneNumbers.push(rp);

            
        }else{
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
        let output = await createAirtimeLogs({
            singleTransaction: airtimeResult.data,
        });

        if (output.status === 'successful') {
            res.redirect('/analytics');
        } else {
            res.json(output);
        }
    } else {
        return res.status(500).json({
            ...airtimeResult,
        });
    }
});

router.get('/sales', (req, res) => {
    res.json({
        status: 'succcessful',
        data: {},
    });
});

module.exports = router;
