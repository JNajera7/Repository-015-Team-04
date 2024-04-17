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
app.delete('/deleteAccount', function(req, res) {
app.delete('/delete_account/:username', function (req, res) {
    const username = req.params.username;

    const deleteAccountQuery = 'DELETE FROM users WHERE username = $1 RETURNING *;';

});

res.render('pages/login');
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




app.get('/index', (req, res) => {
    res.render('pages/index');
});


app.get('/savedpieces', (req, res) => {
    res.render('pages/savedpieces');
});


app.get('/delete', (req, res) => {
    res.render('pages/delete');
});

app.get('/randomize', (req,res) => {
    res.render('pages/randomize');
});


app.get ('/savedfits',(req,res) => {
    res.render('pages/savedfits');
});


app.get ('/suggestedfits',(req,res) => {
    res.render('pages/suggestedfits');
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

// Updating the pieces db when the add form is used
app.post('/savedpieces', async (req, res) => {
    try{
        // Need to fix parsing the req stuff based on what was selected (req length varies....)
        const {
            imgFile,
            name,
            category, 
            subcategory,
            style,
            // CLARIFY WARMTH FUNCTIONALITY?? (and add here)
            // Clarify how we want the tags (color, pattern) inputted
            color,
            pattern
        } = req.body;
        
        await db.none('INSERT INTO pieces (categoryId, subcategoryId, styleId, warmthId, colorId, patternId, tags, imgFile, name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
                        [category, subcategory, style, 0, color, pattern, imgFile, name]);

        res.redirect('/savedpieces');
    } catch (err) {
        console.log(err);
        res.status(500).send('Adding piece unsuccessful');
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
    res.json({status: 'success', message: 'Welcome!'});
  });
  
// Authentication Required
app.use(auth);


app.get('/home', async (req, res) => {
    res.render('pages/home')
});


app.get('/logout', async (req, res) => {
    req.session.destroy();
    res.render('pages/logout', { excludeNav: true });
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
