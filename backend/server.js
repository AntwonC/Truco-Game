import express, { application } from 'express';
import session from 'express-session';
import mysqlSession from 'express-mysql-session';
import ViteExpress from 'vite-express';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'node:path';
import http from 'http';

import connection from '../database/formConnection.js';

import signUpRoute from '../routes/signUp.js';
import loginRoute from '../routes/login.js';
import dashboardRoute from '../routes/dashboard.js';

import socketServer from '../backend/socket.js';



dotenv.config({path: '../env'});

const PORT = 3001;
const dev = process.env.NODE_ENV !== 'production';
const __dirname = import.meta.dirname;

const server = express();
const serverSocket = http.createServer(server);
socketServer(serverSocket);

const reactPath = path;

// This code makes sure that any request that does not matches a static file
// in the build folder, will just serve index.html. Client side routing is
// going to make sure that the correct content will be loaded.
/*server.use((req, res, next) => {
    if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
        next();
    } else {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
}); */
// TO DO: When user sign's up. Have them automatically login possibly?
// serves my react static files
//server.use(express.static(reactPath.join(__dirname, 'build')));

const MySQLStore = mysqlSession(session);
const trucoGameDatabase = connection;

const sessionStore = new MySQLStore({
    expiration: 21600000,
    clearExpired: true,
    checkExpirationInterval: 1800000,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
    
}, trucoGameDatabase);
    
//const tenSec = 1000 * 10;

//const membersRouter = require('./routes/members');


server.use(session({ 
    name: 'random-name',
    resave: false, 
    secret: '123456', 
    saveUninitialized: false, // setting to true will set multiple session objects // https://stackoverflow.com/questions/40381401/when-to-use-saveuninitialized-and-resave-in-express-session
    store: sessionStore,
    cookie: {
        httpOnly: true,
        maxAge: 1800000,
        sameSite: true,
        secure: dev
    }
}));

server.use('/', signUpRoute);
server.use('/login', loginRoute);
server.use('/dashboard', dashboardRoute);
//server.use('/members', membersRouter);




ViteExpress.listen(server, PORT, (err) => {
    if(err) throw err;
    console.log(`Server connected at ${PORT}`);
});

serverSocket.listen(5000, () => {
    console.log(`socket server is listening on *:5000`);
})



export default server;