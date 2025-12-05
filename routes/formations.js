const router = require('express').Router();
const formationsController = require('../controllers/formationsController');


router.get('/', formationsController.list);
router.get('/create', formationsController.createForm);
router.post('/create', formationsController.create);


module.exports = router;