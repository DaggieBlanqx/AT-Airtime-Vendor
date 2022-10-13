const express = require('express');
const path = require('path');
const config = require('config');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session');
const mongoStore = MongoDBStore(session);

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
    app.use(cors());
    app.set('trust proxy', 1); // trust first proxy

    //Code in server.js/index.js (Depending on your server entry point)
    const store = new mongoStore({
        collection: 'userSessions',
        uri: process.env.mongoDBUri,
        expires: 100000000000000,
    });
    app.use(
        session({
            name: 'SESS_NAME',
            secret: 'SESS_SECRET',
            store: store,
            saveUninitialized: false,
            resave: false,
            proxy: true, // Required for Heroku & Digital Ocean (regarding X-Forwarded-For)
            cookie: {
                sameSite: false,
                secure: false,
                httpOnly: true,
            },
        })
    );

    app.use('*', (req, res, next) => {
        const loggedInUser = req.session.user;

        console.log({ loggedInUser });

        next();
    });
    app.use('/', indexRoutes).listen(process.env.PORT, () =>
        console.log(`Listening on ${process.env.PORT}`)
    );
};

/*
START OF DATABASE LAUNCH ACTIONS
*/

//initialize the use of native Node Promise with mongoose
mongoose.Promise = global.Promise;

//create a connection to mongoDB
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const mongodbUri = process.env.mongoDBUri;
mongoose.connect(mongodbUri, mongoOptions);
const conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => {
    console.log(`Vo~ila! MongoDB Connected!\n `);
    main();
});

/*
END OF DATABASE LAUNCH ACTIONS
*/
