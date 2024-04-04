// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
	extname: 'hbs',
	layoutsDir: __dirname + '/views/layouts',
	partialsDir: __dirname + '/views/partials',
});

// database configuration
const dbConfig = {
	host: 'db', // the database server
	port: 5432, // the database port
	database: process.env.POSTGRES_DB, // the database name
	user: process.env.POSTGRES_USER, // the user account to connect with
	password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
	.then(obj => {
		console.log('Database connection successful'); // you can view this message in the docker compose logs
		obj.done(); // success, release the connection;
	})
	.catch(error => {
		console.log('ERROR:', error.message || error);
	});

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		saveUninitialized: false,
		resave: false,
	})
);

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

app.use(express.static(__dirname + '/public'));

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here
app.get('/', (req, res) => {
	res.redirect('/login');
});

app.get('/login', (req, res) => {
	res.render('pages/login');
});

app.get('/settings', (req, res) => {
	res.render('pages/settings');
});

app.get('/register', (req, res) => {
	res.render('pages/register');
});

app.get('/index', (req, res) => {
	res.render('pages/index');
});

// Register
app.post('/register', async (req, res) => {
	try {
		//hash the password using bcrypt library
		const hash = await bcrypt.hash(req.body.password, 10);

		await db.none('INSERT INTO users (username, password) values ($1, $2)', [req.body.username, hash]);
		res.redirect('/login');
	} catch (e) {
		console.log(e);
		res.redirect('/register');
	}
});

// Login
app.post('/login', async (req, res) => {
	try {
		const user = await db.one('SELECT username, password FROM users WHERE username = $1', [req.body.username]);
		// check if password from request matches with password in DB
		const match = await bcrypt.compare(req.body.password, user.password);

		if(match) {
			//save user details in session like in lab 7
			req.session.user = user;
			req.session.save();
			res.redirect('/home');
		}
		else {
			res.render('pages/login', {message: "Incorrect username or password"});
		}
	}
	catch (e) {
		console.log(e);
		res.render('pages/login', {message: "Incorrect username or password"});
	}
});

// Authentication Middleware.
const auth = (req, res, next) => {
	if (!req.session.user) {
		// Default to login page.
		return res.redirect('/login');
	}
	next();
};
  
// Authentication Required
app.use(auth);

app.get('/home', async (req, res) => {
	res.render('pages/home')
});

app.get('/logout', async (req, res) => {
	req.session.destroy();
	res.render('pages/logout', {message: "Logged out Successfully"});
});

app.get('/welcome', (req, res) => {
	res.json({status: 'success', message: 'Welcome!'});
  });

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');