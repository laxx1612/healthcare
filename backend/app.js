'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const bodyParser = require('body-parser');
const http = require('http');
const express = require('express');
const app = express();
const expressJWT = require('express-jwt');
const bearerToken = require('express-bearer-token');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSession = require("connect-mongodb-session")(session);
const User = require('./Model/Users');
const { isAuthenticatedUser, authorizeRoles } = require('./middleware/auth');
const constants = require('./config/constants.json');
const helper = require('./app/helper');
const invoke = require('./app/invoke');
const qscc = require('./app/qscc');
const query = require('./app/query');
const { enrollAdmin } = require('./fabricUtils');

require('dotenv').config();

const host = process.env.HOST || 'localhost'; // Define host variable

const port = process.env.PORT || constants.port;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const connection = mongoose.connection.on('connected', () => {
    console.log('connected to mongoose');
});
mongoose.connection.on('error', (err) => {
    console.log("error while connecting", err);
});

// app.options('*', cors());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bearerToken());

logger.level = 'debug';

const store = new MongoDBSession({
    uri: process.env.MONGO_URI,
    collection: 'mySessions'
});

app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {},
    proxy: true
}));

var server = http.createServer(app).listen(port, function () { console.log(`Server started on ${port}`) });
logger.info('****************** SERVER STARTED ************************');
logger.info('***************  http://%s:%s  ******************', host, port);
server.timeout = 240000;

function getErrorMessage(field) {
    var response = {
        success: false,
        message: field + ' field is missing or Invalid in the request'
    };
    return response;
}

const admin = require('./routes/Admin/Admin');
const patient = require('./routes/Paitient/Patient');
const doctor = require('./routes/Doctor/Doctor');
const chemist = require('./routes/Chemist/Chemist');
const lab = require('./routes/Lab/Lab');
const insurance = require('./routes/Insurance/Insurance');
const chaincode = require('./routes/chaincode/chaincode');

app.use('/api', admin);
app.use('/api', patient);
app.use('/api', doctor);
app.use('/api', chemist);
app.use('/api', lab);
app.use('/api', insurance);
app.use('/api', chaincode);

async function startApp() {
    try {
        // Enroll admin user
        await enrollAdmin();

        // Start your application...
    } catch (error) {
        console.error('Error enrolling admin:', error);
    }
}

// Call startApp function to start the application
startApp();
