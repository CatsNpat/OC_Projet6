const express = require('express');
const stuffCtrl = require('../controllers/book');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const router = express.Router();


router.post('/', auth, multer, stuffCtrl.createBook);
router.post('/:id/rating', auth, stuffCtrl.createRating);
router.get('/', stuffCtrl.getAllBooks);
router.get('/:id', stuffCtrl.getOneBooks);
router.get('/bestrating', stuffCtrl.getBestRating);
router.put('/:id', auth, multer, stuffCtrl.modifyBook);
router.delete('/:id', auth, stuffCtrl.deleteOneBook);

module.exports = router;