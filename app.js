const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { initializeDatabase } = require('./models');
const { loadCurrentUser, requireAdmin } = require('./middleware/auth');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const formateursRouter = require('./routes/formateurs');
const formationsRouter = require('./routes/formations');
const sessionsRouter = require('./routes/sessions');
const inscriptionsRouter = require('./routes/inscriptions');
const presencesRouter = require('./routes/presences');
const avisRouter = require('./routes/avis');

const app = express();

initializeDatabase();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(loadCurrentUser);

app.use('/', indexRouter);
app.use('/api/users', requireAdmin, usersRouter);
app.use('/api/formateurs', requireAdmin, formateursRouter);
app.use('/api/formations', requireAdmin, formationsRouter);
app.use('/api/sessions', requireAdmin, sessionsRouter);
app.use('/api/inscriptions', requireAdmin, inscriptionsRouter);
app.use('/api/presences', requireAdmin, presencesRouter);
app.use('/api/avis', requireAdmin, avisRouter);

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

  return res.status(err.status || 500).render('error');
});

module.exports = app;
