const express = require('express');
const path = require('path');
const config = require('config');
process.env = {
    ...config.get('WEB_APP'),
    ...process.env,
};

let indexRoutes = require('./routes/index.js');

express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .use('/', indexRoutes)
    .listen(process.env.PORT, () =>
        console.log(`Listening on ${process.env.PORT}`)
    );
