import {Request, Response, Router} from 'express';
import Passport = require('passport');

const router = Router();

router.get('/login', (req: Request, res: Response) => {
	res.render('auth/login', {
		_: {
			title: 'Login'
		}
	});
});

router.get('/login-failed', (req: Request, res: Response) => {
	req.logout();
	res.flash('error', 'Sorry, those credentials aren\'t valid.');
	res.redirect('/auth/login');
});

router.post('/login', Passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/auth/login-failed'
}));

router.get('/logout', (req: Request, res: Response) => {
	req.logout();
	res.flash('info', 'You have been logged out.');
	res.redirect('/auth/login');
});

export = router;
