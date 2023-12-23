const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const {run } = require('./utils/gpt.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
});
function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType
      },
    };
  }

const upload = multer({storage: storage}).single('avatar');
app.set('view engine', 'ejs');

//routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/upload', upload, async (req, res) => {
    try {
      const imagePath = req.file.path;
      const result = await run(imagePath); // Pass the image path to the Gemini-Pro Vision function
      res.json(result); // Send the extracted information as JSON
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to process image" });
    }
  });

//to start server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});