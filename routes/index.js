'use strict';
const express = require('express');
const router = express.Router();


router.get('/', (req, res) => res.render('pages/index'));
router.get('/send/:amount/:phoneNumber', async(req,res)=>{
    let phoneNumber = req.params.phoneNumber;
    let amount = req.params.amount;

   const outcome = await res.locals.sendAirtime({
        phoneNumber,amount
    });

    res.json({outcome,
        amount,
        phoneNumber
    })
})

module.exports = router;