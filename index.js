const express = require('express');
const path = require('path');
const config = require('config');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// yarn add uuid connect-mongo
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
            saveUninitialized: false,
            cookie: { secure: true },
        })
    );

    // app.use(session({
    //     genid: (req) => {
    //       return uuidv4()
    //     },
    //     secret: process.env.EXPRESS_SESSION_SECRET,
    //     resave: true,
    //     saveUninitialized: false,
    //     cookie: { maxAge: 24 * 60 * 60 * 1000 },
    //     store: MongoStore.create({
    //       client: mongoose.connection.getClient(),
    //       dbName: process.env.MONGO_DB_NAME,
    //       collectionName: "sessions",
    //       stringify: false,
    //       autoRemove: "interval",
    //       autoRemoveInterval: 1
    //       })
    //     })
    //   );

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
