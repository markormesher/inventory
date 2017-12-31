import Path = require('path');
import BodyParser = require('body-parser');
import Express  = require('express');
import {Request, Response, NextFunction} from 'express';
import ExpressSession = require('express-session');
import ExpressFlash = require('express-flash-2');
import Passport = require('passport');
import NodeSassMiddleware = require('node-sass-middleware');
import ExpressRejection = require('./helpers/express-rejection')
import ConfigLoader = require('./helpers/config-loader');
import PassportConfig = require('./helpers/passport-config');
import AuthHelper = require('./helpers/auth');
import SequelizeDb = require('./helpers/db');
import Seeder = require('./helpers/seeder');
import {StatusError} from './helpers/StatusError';

const secrets = ConfigLoader.getSecrets();
const constants = ConfigLoader.getConstants();

const app = Express();

// db connection
SequelizeDb.sync({force: true}).then(() => {
	console.log('Database models synced successfully');
	Seeder.populateDatabase();
}).catch(err => {
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
app.use(ExpressRejection());
app.use(Passport.initialize());
app.use(Passport.session());
app.use(AuthHelper.loadUser);

// controllers
app.use('/', require('./controllers/root'));
app.use('/auth', require('./controllers/auth'));
app.use('/settings', require('./controllers/settings'));
app.use('/users', require('./controllers/users'));

// kill favicon requests
app.use('/favicon.ico', (req: Request, res: Response) => res.end());

// views
app.set('views', Path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// static files
app.use(Express.static(Path.join(__dirname, 'public')));
[
	'bootstrap',
	'datatables.net',
	'datatables.net-bs',
	'font-awesome',
	'gentelella',
	'jquery',
	'jquery-validation',
	'toastr'
].forEach(lib => {
	app.use(`/_npm/${lib}`, Express.static(Path.join(__dirname, `../node_modules/${lib}`)));
});

// error handlers
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
