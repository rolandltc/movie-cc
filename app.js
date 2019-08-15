'use strict';

const cors = require('cors');
const createError = require('http-errors');
const express = require('express');

const config = require('./config');
const v1 = require('./routes/v1');

const answers = require('./models/answers');

const app = express();

if (config.env != 'dev' && config.env != 'prod') {
  throw new Error('config.js entry dev has to be either "dev" or "prod"');
}

answers.calculateAnswer()
.then(() => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use('/v1', v1);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    // res.json(err);
  });
})
.catch((err) => { console.log('error calculating answer: ', err); });


module.exports = app;
