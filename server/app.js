var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
import fallback from 'express-history-api-fallback';

var index = require('./routes/index');
var users = require('./routes/users');
var aws = require('./routes/aws');
var images = require('./routes/images');

import {MysqlService} from './services/mysql.service';

var app = express();

app.use(cors());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use('/', index);
app.use('/api/users', users);
app.use('/api/aws', aws);
app.use('/api/images', images);

app.use('/api/*', function (req, res) {
  res.send('endpoint not found');
});


const root = path.join(__dirname, 'dist_client');
app.use(express.static(root));
app.use(fallback('index.html', { root }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Endpoint Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

MysqlService.config();

module.exports = app;
