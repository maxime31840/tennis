const express = require('express');
const router = express.Router();
const User = require('../models/users');

router.post('/', async (req, res) => {
    try {
        const {nom, prenom, email, password, role} = req.body;

        const user = await User.create({
            nom,
            prenom,
            email,
            password,
            role
        });
    res.status(201).json(user);
    }catch(err) {
        console.error(err);
        res.status(400).json({
            message: err.message 
            });
    }
});

router.get('/', async (req,res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    }catch(err) {
        res.status(500).json({
            message: err.message 
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({
            message: 'User not found'
        });
        res.json(user);  
    }catch(err) {
        res.status(500).json({
            message: err.message
        });
    }
});
    
router.put('/:id', async (req,res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({
            message: 'Not a valid id'
        });
        const {nom, prenom, email, password, role} = req.body;
        const user = await User.findByPk(id);

        if (!user) return res.status(404).json({
            message: 'user not found'
        });
        await user.update ({
            nom,
            prenom,
            email,
            password,
            role
        });
        res.json(user);
    }catch(err) {
        res.status(400).json({
            message: err.message
        });
    }
});

router.delete('/:id', async (req,res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({
            message: 'invalid id'
        });
        
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({
            message: 'user not found'
        });

        await user.destroy();
        res.status(204).send();
    }catch(err) {
        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;