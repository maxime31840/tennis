const express = require('express');
const path = require('path');
const app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const formateursRouter = require('./routes/formateurs');
const formationsRouter = require('./routes/formations');
const sessionsRouter = require('./routes/sessions');
const inscriptionsRouter = require('./routes/inscriptions');
const presencesRouter = require('./routes/presences');
const avisRouter = require('./routes/avis');


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/formateurs', formateursRouter);
app.use('/formations', formationsRouter);
app.use('/sessions', sessionsRouter);
app.use('/inscriptions', inscriptionsRouter);
app.use('/presences', presencesRouter);
app.use('/avis', avisRouter);


module.exports = app;