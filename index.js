const express = require('express');
const path = require('path');
const config = require('config');
const WEB_APP_ENV = config.get('WEB_APP');

const AfricasTalking = require('africastalking');
AT_Airtime = AfricasTalking({
    apiKey: WEB_APP_ENV.apiKey,
    username: WEB_APP_ENV.username,
}).AIRTIME;



const sendAirtime = ({ phoneNumber, amount, currencyCode }) => {
    return new Promise((resolve, reject)=>{
        const options = {
            recipients: [
                {
                    phoneNumber,
                    currencyCode: currencyCode || 'KES',
                    amount,
                },
            ],
        };
        
        AT_Airtime
            .send(options)
            .then((response) => resolve(response))
            .catch((error) => reject(error));
    })
    
  
};


let indexRoutes = require('./routes/index.js');
const { rejects } = require('assert');
const { resolve } = require('path');

express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .use((req,res,next)=>{
        res.locals.sendAirtime = sendAirtime;
        next();
    })
    .use('/', indexRoutes)
    .listen(WEB_APP_ENV.PORT, () =>
        console.log(`Listening on ${WEB_APP_ENV.PORT}`)
    );
