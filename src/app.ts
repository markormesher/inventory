import Path = require('path');
import BodyParser = require('body-parser');
import Express  = require('express');
import {Request, Response, NextFunction} from 'express';
import ExpressSession = require('express-session');
import Passport = require('passport');
import NodeSassMiddleware = require('node-sass-middleware');

import ConfigLoader = require('./helpers/config-loader');
import PassportConfig = require('./helpers/passport-config');
import AuthHelper = require('./helpers/auth');
import SequelizeDb = require('./helpers/db');
import Seeder = require('./helpers/seeder');

import RootController = require('./controllers/root');
import AuthController = require('./controllers/auth');
import ExpressFlash = require("express-flash-2");

const secrets = ConfigLoader.getSecrets();
const constants = ConfigLoader.getConstants();

declare global {
	// defined here, used in front-end JS and Pug code
	//noinspection JSUnusedGlobalSymbols
	interface Window {
		Inventory: any;
	}
}

const app = Express();

// db connection
SequelizeDb.sync().then(() => {
	console.log('Database models synced successfully');
	Seeder.populateDatabase();
}).error((err) => {
	console.log('Failed to sync database models');
	console.log(err);
});

// form body content
app.use(BodyParser.urlencoded({extended: false}));

// sass conversion
app.use(NodeSassMiddleware({
	src: Path.join(__dirname, '/assets/'),
	dest: Path.join(__dirname, '/public'),
	outputStyle: 'compressed'
}));

// cookies and sessions
app.use(ExpressSession({
	secret: secrets.sessionSecret,
	resave: false,
	saveUninitialized: false
}));

// flash messages
app.use(ExpressFlash());

// auth
PassportConfig.init(Passport);
app.use(Passport.initialize());
app.use(Passport.session());
app.use(AuthHelper.loadUser);

// controllers
app.use('/', RootController);
app.use('/auth', AuthController);

// kill favicon requests
app.use('/favicon.ico', (req: Request, res: Response) => res.end());

// views
app.set('views', Path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(Express.static(Path.join(__dirname, 'public')));

// error handlers
class StatusError extends Error {
	status: number;
}

app.use((req: Request, res: Response, next: NextFunction) => {
	const err = new StatusError('Not Found');
	err.status = 404;
	next(err);
});
app.use((error: StatusError, req: Request, res: Response) => {
	res.status(error.status || 500);
	res.render('root/error', {
		_: {
			title: error.status + ': ' + error.message
		},
		message: error.message,
		status: error.status || 500,
		error: process.env.ENV === 'dev' ? error : ''
	});
});

// go!
app.listen(constants.port, () => console.log(`Listening on port ${constants.port}`));
