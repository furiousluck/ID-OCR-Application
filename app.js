const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const {run } = require('./utils/gpt.js');
const {convertStringtoJSON} = require('./utils/stringtojson.js');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const path = require('path');
var imgSchema = require('./utils/model.js');
const datahandle = require('./utils/data-model.js');
const { toArray } = require('./utils/toarray.js');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
.then(console.log("DB Connected"))

app.use(express.json({limit:'2mb'}));
app.use(express.urlencoded({ extended: false, limit: '2mb' }))


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const upload = multer({storage: storage}).single('avatar');
app.set('view engine', 'ejs');

//routes
app.get('/', (req, res) => {
    res.render('index');
});

// Endpoint to retrieve all images with message
app.get('/images', async (req, res) => {
  try {
    const images = await imgSchema.find();

    // Process each image, for example, log its properties
    // images.forEach(element => {
    //   console.log('Image Desc:', element.desc);
    //   console.log('Image Data:', element.img.data); // Assuming 'img' is a field in your schema
    // });

    // Send the images as JSON response
    res.status(200).json(images);
  } catch (err) {
    console.error('Error retrieving images:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/upload', upload, async (req, res) => {
  try {
    console.log(req.file);
    const result = await run(req.file.path,req.file.mimetype); // Pass the image path to the Gemini-Pro Vision function
    const jsonData = convertStringtoJSON(result);
    const checkdeddata = toArray(result);
    let x1= 1;
    if(jsonData=="NA"){
      x1=0;
    }
    // res.statusCode=200;
    // res.setHeader("Content-Type", "application/json");
    // res.write(JSON.stringify(jsonData));
    // Read the image file and convert it to base64
    const imageData = fs.readFileSync(path.join(__dirname, '/uploads/', req.file.filename));
    const base64Image = Buffer.from(imageData).toString('base64');
    // console.log(base64Image);
    let x = "Data extracted successfully";
    if(x1==0){
      x="Blurry Image.Retry Again!!"
    }
    var obj = {
      desc: x,
      img: {
        data: base64Image,
        contentType: req.file.mimetype
      }
    }
    var obj1 = {
      idNumber: checkdeddata[0],
      firstname: checkdeddata[1],
      lastName: checkdeddata[2],
      dateOfBirth: checkdeddata[3],
      dateOfIssue: checkdeddata[4],
      dateOfExpiry: checkdeddata[5],
      dateOfUpload: checkdeddata[6],
      status: checkdeddata[7]
    }
    datahandle.create(obj1)
    imgSchema.create(obj)
  .then(item => {
    // Only redirect if the creation was successful
    if(x1===1)
    {
      res.statusCode=200;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(jsonData));
    console.log('Data inserted: ', item);
    }
    else{
      res.statusCode=404;
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify({ error: "Blurry Image.Retry Again!!" }));
    }
    // res.redirect('/');
  })
  .catch(err => {
    console.log('Data not inserted: ', err);
    // Handle the error appropriately (send an error response, log, etc.)
  })
  .finally(() => {
    // Make sure to end the response after handling the async operation
    res.end();
  });
    // res.json(jsonData); // Send the extracted information as JSON
  } catch (error) {
    console.error(error);
    res.setHeader(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Could not process image" }));
  }
});

//to start server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});