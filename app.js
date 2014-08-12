var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session'),
    MongoStore = require('connect-mongo')(session);

var bodyParser = require('body-parser');

var ember = require('./routes/ember');

var config = require('./config');

var app = express();

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser(config.sessionSecret));
app.use(session({
  store: new MongoStore({db: config.dbName}),
  key: 'sid',
  resave: true,
  saveUninitialized: true,
  secret: config.sessionSecret
}));

app.use(express.static(path.join(__dirname, 'ember-starter')));

/**
 * App.ApplicationAdapter = DS.RESTAdapter.extend({
   * // namespace属性用来指定一个特定的url前缀。
   * namespace: 'ember/api/v0.1'
   * });
 */
app.use('/ember/api/v0.1/', ember);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
