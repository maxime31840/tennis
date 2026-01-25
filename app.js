const PORT = process.env.PORT || 3001;
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var formateursRouter = require('./routes/formateurs');
var formationsRouter = require('./routes/formations');
var sessionsRouter = require('./routes/sessions');
var inscriptionsRouter = require('./routes/inscriptions');
var presencesRouter = require('./routes/presences');
var avisRouter = require('./routes/avis');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/formateurs', formateursRouter);
app.use('/formations', formationsRouter);
app.use('/sessions', sessionsRouter);
app.use('/inscriptions', inscriptionsRouter);
app.use('/presences', presencesRouter);
app.use('/avis', avisRouter);

const apiUsers = require('./controllers/usersController');
app.use('/api', apiUsers);

const apiFormateurs = require('./controllers/formateursController');
app.use('/api', apiFormateurs);

const apiFormations = require('./controllers/formationsController');
app.use('/api', apiFormations);

const apiSessions = require('./controllers/sessionsController');
app.use('/api', apiSessions);

const apiInscriptions = require('./controllers/inscriptionsController');
app.use('/api', apiInscriptions);

const apiPresences = require('./controllers/presencesController');
app.use('/api', apiPresences);

const apiAvis = require('./controllers/avisController');
app.use('/api', apiAvis);

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
  res.render('error');
});

module.exports = app;
