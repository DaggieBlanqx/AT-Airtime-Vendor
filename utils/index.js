'use strict';
const fs = require('fs');
const validate = require('validate.js');
const AfricasTalking = require('africastalking');

const AT_Airtime = AfricasTalking({
    apiKey: process.env.apiKey,
    username: process.env.username,
}).AIRTIME;

const FAIL = ({ message }) => {
    return {
        status: 'failed',
        message: message || 'Oops! Something unexpected just happened',
    };
};

const sendAirtime = ({ phoneNumber, amount, currencyCode }) => {
    return new Promise((resolve, reject) => {
        const options = {
            recipients: [
                {
                    phoneNumber,
                    currencyCode: currencyCode || 'KES',
                    amount,
                },
            ],
        };

        AT_Airtime.send(options)
            .then((response) => resolve(response))
            .catch((error) => reject(error));
    });
};

const doesFileExist = ({ filePath }) => {
    try {
        const s = fs.existsSync(filePath);
        if (fs.existsSync(filePath)) {
            //file exists
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    }
};

const writeToFile = ({ data, filePath }) => {
    return new Promise((resolve, reject) => {
        //check if data is valid JSON
        if (validate.isEmpty(data)) {
            reject(
                FAIL({
                    message: 'data is invalid',
                })
            );
        }

        if (!filePath) {
            reject(
                FAIL({
                    message: 'filepath is invalid',
                })
            );
        }

        let readyData = JSON.stringify(data, null, 2);

        fs.writeFile(filePath, readyData, (err) => {
            if (err) throw reject({ status: 'failed', ...err });
            resolve({
                status: 'successful',
                data,
            });
        });
    });
};

const createBusinessOwnerFile = ({ apiKey, username, password }) => {
    return new Promise(async (resolve, reject) => {
        let filePath = `${process.cwd()}/config/production.json`;

        if (!apiKey) {
            reject(
                FAIL({
                    message: '"apiKey" is invalid',
                })
            );
        }
        if (!username) {
            reject(
                FAIL({
                    message: '"username" is invalid',
                })
            );
        }
        if (!password) {
            reject(
                FAIL({
                    message: '"password" is invalid',
                })
            );
        }

        if (doesFileExist(filePath)) {
            reject(
                FAIL({
                    message: 'Application has already been setup.',
                })
            );
        }

        let data = {
            WEB_APP: {
                apiKey,
                username,
                password,
            },
        };

        const newFile = await writeToFile({ data, filePath });

        if (newFile.status === 'successful') {
            resolve({
                status: 'successful',
                message:
                    'Congratulations! Your business is now ready to vend some airtime.',
            });
        } else {
            reject(FAIL());
        }
    });
};

module.exports = {
    sendAirtime,
    doesFileExist,
    writeToFile,
    createBusinessOwnerFile,
};
