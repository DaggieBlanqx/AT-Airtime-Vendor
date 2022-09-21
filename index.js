const express = require('express');
const path = require('path');
const config = require('config');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');

process.env = {
    ...config.get('WEB_APP'),
    ...process.env,
};

let indexRoutes = require('./routes/index.js');

const main = async () => {
    const app = express();

    app.use(express.static(path.join(__dirname, 'public')))
        .set('views', path.join(__dirname, 'views'))
        .set('view engine', 'ejs');

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
    app.use(express.urlencoded({ extended: false }));

    let corsConfig = () => {
        return {
            origin: '*',
            methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                ' Authorization',
                'Accept',
                ' Accept-Language',
                ' Content-Language',
                ' Content-Type',
                'mode',
                'credentials',
                'x-auth-token',
                'Access-Control-Allow-Origin',
                'token',
                'x-active-company',
            ],
            exposedHeaders: [
                'Content-Type',
                ' Authorization',
                'Content-Range',
                'X-Content-Range',
                'x-auth-token',
                'Access-Control-Allow-Origin',
                'token',
                'x-active-company',
            ],
            credentials: true,
            maxAge: 3600,
            preflightContinue: true,
            optionsSuccessStatus: 204,
        };
    };

    app.use(cors(corsConfig()));
    app.set('trust proxy', 1); // trust first proxy
    app.use(
        session({
            secret: '1234567890',
            resave: false,
            saveUninitialized: true,
            cookie: { secure: true },
        })
    );

    app.use('*', (req, res, next) => {
        console.log({
            user: req.session.user,
        });

        next();
    });
    app.use('/', indexRoutes).listen(process.env.PORT, () =>
        console.log(`Listening on ${process.env.PORT}`)
    );
};
main();
