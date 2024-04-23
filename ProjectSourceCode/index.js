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
    const errorMessage = req.session.errorMessage; // Get the error message from the session
    req.session.errorMessage = null; // Clear the error message from the session

    // If the user entered a wrong password or username it will notifythe user
    // otherwise it will just render the login page
    // excludeNav:true (also seen in get /register) is to remove the Navbar from
    // the login page and the register page as the user should not be able to access
    // any of the other pages like settings, home or any of Wizard Wardrobes functions.
    if (errorMessage) {
        res.render('pages/login', { excludeNav: true, message: errorMessage });
    } else {
        res.render('pages/login', { excludeNav: true });
    }
});


app.get('/settings', (req, res) => {
    res.render('pages/settings');
});

//Account deletion function
app.delete('/deleteAccount', async function (req, res) {
    try {
        // Assuming you're using the username stored in req.session.user
        const username = req.session.user.username;

        // Execute the DELETE query to remove the user account from the database
        const userDeleted = await db.oneOrNone('DELETE FROM users WHERE username = $1 RETURNING *;', [username]);

        if (userDeleted) {
            // If the user account was successfully deleted, destroy the session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                } else {
                    console.log('Session destroyed.');
                }
            });
            res.render('pages/login');
        } else {
            // If the user account was not found, handle the error accordingly
            res.status(404).send('User account not found.');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/register', (req, res) => {
    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;

    if (errorMessage) {
        res.render('pages/register', { excludeNav: true, message: errorMessage });
    } else {
        res.render('pages/register', { excludeNav: true });
    }
});


// Register
app.post('/register', async (req, res) => {
    // Hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);
    try {
        await db.none('INSERT INTO users (username, password) values ($1, $2)', [req.body.username, hash]);
        res.redirect('/login');
    } catch (e) {
        req.session.errorMessage = "Unexpected error occurred";
        res.redirect('/register');
    }
});

app.post('/addNewPiece', async (req, res) => {
    try {
        // Assigning all input
        const imgFile = req.body.image;
        const catinput = req.body.category;
        const subcatinput = req.body.subcategory;
        const styleinput = req.body.style;
        const colorinput = req.body.color;
        const patterninput = req.body.pattern;

        // Getting Ids
        let catId;
        let subcatId;
        let styleId;
        let colorId;
        let patternId;

        try {
            catId = await db.one('SELECT id FROM categories WHERE category = $1', [catinput]);
        } catch (err) {
            catId = await db.one('INSERT INTO categories (category) VALUES ($1) RETURNING id', [catinput]);
        }

        try {
            subcatId = await db.one('SELECT id FROM subcategories WHERE subcategory = $1', [subcatinput]);
        } catch (err) {
            subcatId = await db.one('INSERT INTO subcategories (subcategory) VALUES ($1) RETURNING id', [subcatinput]);
        }

        try {
            styleId = await db.one('SELECT id FROM styles WHERE style = $1', [styleinput]);
        } catch (err) {
            styleId = await db.one('INSERT INTO styles (style) VALUES ($1) RETURNING id', [sytleinput]);
        }

        try {
            colorId = await db.one('SELECT id FROM colors WHERE color = $1', [colorinput]);
        } catch (err) {
            colorId = await db.one('INSERT INTO colors (color) VALUES ($1) RETURNING id', [colorinput]);
        }

        try {
            patternId = await db.one('SELECT id FROM patterns WHERE pattern = $1', [patterninput]);
        } catch (err) {
            patternId = await db.one('INSERT INTO patterns (pattern) VALUES ($1) RETURNING id', [patterninput]);
        }

        const pieceId = await db.one(`INSERT INTO pieces (categoryId, subcategoryId, styleId, colorId, patternId, imgFile) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [catId, subcatId, styleId, colorId, patternId, imgFile]);
        res.redirect('/savedpieces');

    } catch (err) {
        req.session.errorMessage = "Unexpected error occurred";
        res.redirect('/savedpieces');
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const user = await db.one('SELECT username, password FROM users WHERE username = $1', [req.body.username]);
        // check if password from request matches with password in DB
        const match = await bcrypt.compare(req.body.password, user.password);

        if (match) {
            req.session.user = user;
            req.session.save();
            res.redirect('/home');
        } else { //Added function to customize error message to notify the User if their password was wrong or Username was not found.
            req.session.errorMessage = "Incorrect password";
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
        req.session.errorMessage = "Username not found";
        res.redirect('/login');
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

app.get('/welcome', (req, res) => {
    res.json({ status: 'success', message: 'Welcome!' });
});

// Authentication Required
app.use(auth);


app.get('/home', async (req, res) => {
    res.render('pages/home')
});

app.get('/index', (req, res) => {
    res.render('pages/index');
});


app.get('/savedpieces', (req, res) => {
    res.render('pages/savedpieces');
});


app.get('/delete', (req, res) => {
    res.render('pages/delete');
});

app.get('/randomize', (req, res) => {
    res.render('pages/randomize');
});


app.get('/savedfits', (req, res) => {
    res.render('pages/savedfits');
});


app.get('/suggestedfits', (req, res) => {
    res.render('pages/suggestedfits');
});


app.get('/logout', async (req, res) => {
    req.session.destroy();
    res.render('pages/login', { excludeNav: true });
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
