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
            .then((response) =>
                resolve({
                    status: 'successful',
                    result: response,
                })
            )
            .catch((error) => {
                // console.error({error})
                if (error?.toString()?.includes('status code 401')) {
                    reject(
                        FAIL({
                            message: 'Invalid apiKey and username',
                        })
                    );
                } else {
                    reject(
                        FAIL({
                            ...error,
                        })
                    );
                }
            });
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

const writeJSONFile = ({ data, filePath }) => {
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

const readJSONFile = ({ filePath }) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) throw reject(FAIL({ ...err }));

            resolve({
                status: 'successful',
                data: JSON.parse(data),
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

        const newFile = await writeJSONFile({ data, filePath });

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

const createAirtimeLogs = ({ singleTransaction }) => {
    return new Promise(async (resolve, reject) => {
        let filePath = `${process.cwd()}/data_store/logs.json`;

        const allTransactions = [];

        const Logs = await readJSONFile({ filePath });

        if (Logs.status !== 'successful') {
            reject(FAIL({ ...Logs }));
        }

        console.log({ Logs });

        Logs.data.map((log) => allTransactions.push(log));

        allTransactions.push(singleTransaction);

        const output = await writeJSONFile({
            data: allTransactions,
            filePath,
        });

        if (output.status === 'successful') {
            resolve({
                status: 'succesful',
            });
        } else {
            reject(FAIL({ ...output }));
        }
    });
};

module.exports = {
    sendAirtime,
    doesFileExist,
    writeJSONFile,
    createBusinessOwnerFile,
    createAirtimeLogs,
};