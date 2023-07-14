const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const convertToWebp = require('../middleware/sharp');
const router = express.Router();

const booksCtrl = require('../controllers/books')

router.post('/', auth,  multer, convertToWebp, booksCtrl.createBook);
router.post('/:id/rating', auth, booksCtrl.rateBook);

router.put('/:id', auth,  multer, convertToWebp, booksCtrl.modifyBook);

router.delete('/:id', auth, booksCtrl.deleteBook);

router.get('/bestrating', booksCtrl.getBestRatedBooks);
router.get('/:id', booksCtrl.getOneBook);
router.get('/', booksCtrl.getAllBooks);



module.exports = router;