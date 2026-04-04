const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { initializeDatabase } = require('./models');
const { loadCurrentUser, requireAdmin } = require('./middleware/auth');

<<<<<<< HEAD
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const formateursRouter = require('./routes/formateurs');
const formationsRouter = require('./routes/formations');
const sessionsRouter = require('./routes/sessions');
const inscriptionsRouter = require('./routes/inscriptions');
const presencesRouter = require('./routes/presences');
const avisRouter = require('./routes/avis');
=======
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var formateursRouter = require('./routes/formateurs');
var formationsRouter = require('./routes/formations');
var sessionsRouter = require('./routes/sessions');
var inscriptionsRouter = require('./routes/inscriptions');
var presencesRouter = require('./routes/presences');
var avisRouter = require('./routes/avis');
>>>>>>> d047430d198dd8a6774cb1a1badb9d212d5c473d

const app = express();

initializeDatabase();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
<<<<<<< HEAD
app.use(loadCurrentUser);

app.use('/', indexRouter);
app.use('/api/users', requireAdmin, usersRouter);
app.use('/api/formateurs', requireAdmin, formateursRouter);
app.use('/api/formations', requireAdmin, formationsRouter);
app.use('/api/sessions', requireAdmin, sessionsRouter);
app.use('/api/inscriptions', requireAdmin, inscriptionsRouter);
app.use('/api/presences', requireAdmin, presencesRouter);
app.use('/api/avis', requireAdmin, avisRouter);
=======
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
>>>>>>> d047430d198dd8a6774cb1a1badb9d212d5c473d

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      message: err.message || 'Erreur interne du serveur.',
    });
  }

<<<<<<< HEAD
  return res.status(err.status || 500).render('error');
});

=======
>>>>>>> d047430d198dd8a6774cb1a1badb9d212d5c473d
module.exports = app;
