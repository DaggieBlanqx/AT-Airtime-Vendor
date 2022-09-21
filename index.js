const express = require('express');
const path = require('path');
const config = require('config');
const WEB_APP = config.get('WEB_APP');

express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .listen(WEB_APP.PORT, () => console.log(`Listening on ${WEB_APP.PORT}`));
