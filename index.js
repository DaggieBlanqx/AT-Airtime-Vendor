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
    const options = {
        recipients: [
            {
                phoneNumber,
                currencyCode: currencyCode || 'KES',
                amount,
            },
        ],
    };

    // That’s it hit send and we’ll take care of the rest
    airtime
        .send(options)
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
        });
};

sendAirtime();

console.log({ WEB_APP_ENV });

express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .listen(WEB_APP_ENV.PORT, () =>
        console.log(`Listening on ${WEB_APP_ENV.PORT}`)
    );
