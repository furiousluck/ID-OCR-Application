const express = require('express');
const router = express.Router();
const { getAllImages, uploadImage } = require('../controllers/ocrController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const upload = multer({storage: storage}).single('avatar');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/images', getAllImages);
router.get('/upload',upload, uploadImage);

module.exports = router;