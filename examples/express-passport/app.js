var express = require('express')
    , morgan = require('morgan')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , methodOverride = require('method-override')
    , expressSession = require('express-session')
    , passport = require('passport')
    , util = require('util')
    , TequilaStrategy = require('../../lib/passport-tequila').Strategy;

// Wiring up Passport session management.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing. However, since this example does not
// have a database of user records, the complete Tequila session state is
// serialized and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the TequilaStrategy within Passport.
var tequila = new TequilaStrategy({
    service: "Demo Tequila App in node.js",
    request: ["displayname"],
    // require: "group=openstack-sti",  // Uncomment and use a group you are a member of.
});
passport.use(tequila);

var app = express();
// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride());
app.use(expressSession({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
// Initialize Passport! Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.get('/', function(req, res){
    res.render('index', { user: req.user });
});

// This is how you Tequila-protect a page:
app.get('/private', tequila.ensureAuthenticated, function(req, res){
    res.render('private', { user: req.user });
});

// To log out, just drop the session cookie.
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

// Alternatively, we can also log out from Tequila altogether.
app.get('/globallogout', tequila.globalLogout("/"));

var portNumber = process.env.PORT || 3000;
app.listen(portNumber);
console.log('Demo server listening on port ' + portNumber);
