const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const {run } = require('./utils/gpt.js');
const {convertStringtoJSON} = require('./utils/stringtojson.js');

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
      console.log(req.file);
      const result = await run(req.file.path,req.file.mimetype); // Pass the image path to the Gemini-Pro Vision function
      const jsonData = convertStringtoJSON(result);
      res.statusCode=200;
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify(jsonData));
      res.end();
      // res.json(jsonData); // Send the extracted information as JSON
    } catch (error) {
      console.error(error);
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Could not process image" }));
    }
  });

//to start server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});