'use strict';
const log = require('signale');
const jwt = require('jsonwebtoken');
const { phone } = require('phone');
const { validationResult, checkSchema } = require('express-validator');
const { capitalizeText, isValidDate, constraintsService } = require('../utils');

const validate = (validations) => {
    //Process the validation requests in parallel
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        var errorsList = errors.array().map((error) => {
            return {
                type: 'input_validation',
                message: error.msg,
                input_field: error.param,
                location: error.location,
                value: error.value,
            };
        });

        return res.status(400).json({
            status: 'failure',
            errorsList,
        });
    };
};

const buildAndValidateSchema = (config) => {
    const templateSchema = {
        id: (fieldLocation = []) => {
            return {
                in: [...fieldLocation],
                errorMessage: 'ID is invalid. It must be a number',
                isInt: true,
                toInt: true,
            };
        },
        user_id: (fieldLocation = []) => {
            return {
                in: [...fieldLocation],
                errorMessage: 'The "user_id" is invalid. It must be a number',
                isInt: true,
                toInt: true,
            };
        },

        // Support bail functionality in schemas
        email: (fieldLocation = []) => {
            return {
                in: [...fieldLocation],
                isEmail: {
                    bail: true,
                },
                errorMessage: 'A valid "email" address is required.',
            };
        },
        token: (fieldLocation = []) => {
            return {
                in: [...fieldLocation],
                custom: {
                    options: (value) => {
                        let customValue;

                        jwt.verify(
                            value,
                            process.env.PRIVATE_KEY,
                            (err, currentUser) => {
                                if (err) {
                                    customValue = false;
                                } else {
                                    customValue = true;
                                }
                            }
                        );

                        return customValue;
                    },
                },
                errorMessage:
                    'The token that you provided is invalid or expired!',
            };
        },

        userName: (fieldLocation = []) => {
            return {
                in: [...fieldLocation],
                customSanitizer: {
                    options: (value, { req, location, path }) => {
                        let sanitizedValue;
                        if (value) {
                            sanitizedValue = value.toLowerCase();
                        } else {
                            sanitizedValue = '';
                        }
                        return sanitizedValue;
                    },
                },
                custom: {
                    options: (value, { req, location, path }) => {
                        let customValue;
                        var regex = /^[a-zA-Z0-9]*-?[a-zA-Z0-9]*$/;
                        if (value) {
                            customValue = regex.test(value);
                        } else {
                            customValue = false;
                        }
                        return customValue;
                    },
                },
                errorMessage:
                    'username is invalid. It can only be letters, numbers and dashes',
            };
        },
        phoneNumber: (fieldLocation = []) => {
            return {
                in: [...fieldLocation],
                custom: {
                    options: (value, { req, location, path }) => {
                        let customValue = false;

                        if (!value) return customValue;

                        constraintsService.countries.map((country) => {
                            if (phone(value, { country }).isValid)
                                customValue = true;
                        });

                        return customValue;
                    },
                },
                errorMessage: `Phone is invalid. It can only follow the phone number formats of ${constraintsService.countries.join(
                    ' or '
                )}.`,
            };
        },
        password: (fieldLocation = []) => {
            return {
                in: [...fieldLocation],
                custom: {
                    options: (value, { req, location, path }) => {
                        let customValue = false;
                        var regex =
                            /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/;
                        if (!value) return customValue;
                        customValue = regex.test(value);
                        console.log({
                            customValue,
                        });
                        return customValue;
                    },
                },
                errorMessage: 'The password is too short.',
            };
        },
        newPassword: (fieldLocation = []) => {
            return {
                in: [...fieldLocation],
                custom: {
                    options: (value, { req, location, path }) => {
                        let customValue = false;
                        var regex =
                            /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/;
                        if (!value) return customValue;
                        customValue = regex.test(value);
                        console.log({
                            customValue,
                        });
                        return customValue;
                    },
                },
                errorMessage: 'The password is too short.',
            };
        },
        agreedToTandCandP: (fieldLocation = []) => {
            return {
                in: [...fieldLocation],
                custom: {
                    options: (value) => {
                        let customValue = false;
                        if (!value) return customValue;
                        if (value === 'on') customValue = true;
                        return customValue;
                    },
                },
                errorMessage:
                    'You must agree to the privacy policy , terms and conditions for us to process your data',
            };
        },
        city: (fieldLocation = []) => {
            return {
                in: [...fieldLocation],
                customSanitizer: {
                    options: (value) => {
                        let sanitizedValue;
                        if (value) {
                            sanitizedValue = capitalizeText(value);
                        } else {
                            sanitizedValue = '';
                        }
                        return sanitizedValue;
                    },
                },
                custom: {
                    options: (value) => {
                        let customValue;
                        const regex =
                            /^[a-zA-ZáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]*-?[a-zA-ZáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]*$/;
                        if (value) {
                            customValue = regex.test(value);
                        } else {
                            customValue = false;
                        }
                        return customValue;
                    },
                },
                errorMessage:
                    'Lastname is an invalid format. Can only include letters',
            };
        },
        page: (fieldLocation = []) => {
            return {
                in: [...fieldLocation],
                errorMessage: '"page" is invalid. It must be a number',
                isInt: true,
                toInt: true,
            };
        },
        size: (fieldLocation = []) => {
            return {
                in: [...fieldLocation],
                errorMessage: '"size" is invalid. It must be a number',
                isInt: true,
                toInt: true,
            };
        },
    };

    var generatedSchema = {};

    Object.keys(config).forEach((key) => {
        if (!templateSchema[key]) {
            let error = `\nThe submission field "${key}" does not exist in templateSchema.\nSuggestedSolution: Create it in the templateSchema or remove it from the passed in parameters(i.e config).\n`;
            log.fatal(error);
            throw new Error(error);
        }
        generatedSchema[key] = templateSchema[key](config[key]);
    });
    return validate(checkSchema(generatedSchema));

    /*
    * Example of how to use this function:

        app.post(
            '/test',
            buildAndValidateSchema({
                id: ['params'],
                password: ['body'],
                firstName: ['body'],
                email: ['body'],
                someField: ['query'],
                anotherField: ['cookies'],
                yetAnotherField: ['headers'],
                andAnotherOne: ['body','cookies','headers','params','query'],
            }),
            (req, res) => {
                // Do something
            });

    **Note: If you add a field to the schema, you must add it to the templateSchema object else an error will be thrown.
    ** templateSchema exists for reusability.
    */
};

module.exports = {
    validate,
    buildAndValidateSchema,
};
