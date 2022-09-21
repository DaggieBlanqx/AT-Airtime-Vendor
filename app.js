// Set your app credentials
const credentials = {
    apiKey: 'MyAppAPIkey',
    username: 'MyAppUsername',
};

// Initialize the SDK
const AfricasTalking = require('africastalking')(credentials);

// Get the airtime service
const airtime = AfricasTalking.AIRTIME;

function sendAirtime() {
    const options = {
        recipients: [
            {
                phoneNumber: 'MyPhoneNumber',
                currencyCode: 'KES',
                amount: '100',
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
}

sendAirtime();
