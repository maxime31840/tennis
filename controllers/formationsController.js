const db = require('../models/formations');


exports.list = async (req, res) => {
const [rows] = await db.query('SELECT * FROM formations');
res.render('formations/list', { formations: rows });
};


exports.createForm = (req, res) => {
res.render('formations/create');
};


exports.create = async (req, res) => {
const { titre, description } = req.body;
await db.query('INSERT INTO formations (titre, description) VALUES (?, ?)', [titre, description]);
res.redirect('/formations');
};