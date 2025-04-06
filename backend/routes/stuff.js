const express = require('express');
const router = express.Router();
const stuffCtrl = require('../controllers/stuff');

router.post('/', stuffCtrl.createBook);
router.get('/', stuffCtrl.getAllBooks);
router.get('/:id', stuffCtrl.getOneBooks);
router.put('/:id', stuffCtrl.modifyBook);
router.delete('/:id', stuffCtrl.deleteOneBook);

module.exports = router;