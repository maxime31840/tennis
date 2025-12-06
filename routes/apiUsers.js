// const express = require('express');
// const User = require('../models/users')

// const router = express.Router();
// const bcrypt = require('bcrypt');

// router.post('/user', async (req, res) => {
//   try {
//     const { nom, prenom, email, password, role } = req.body;
//     console.log(req.body);
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       nom, prenom, email, password: hashedPassword, role
//     });

//     res.status(201).json({ success: true, message: 'Utilisateur créé', user: newUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Erreur serveur.' });
//   }
// });



// module.exports = router;