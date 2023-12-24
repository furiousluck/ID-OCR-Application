const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const {run } = require('./utils/gpt.js');
const {convertStringtoJSON} = require('./utils/stringtojson.js');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const path = require('path');
var imgSchema = require('./model/model.js');
const datahandle = require('./model/data-model.js');
const { toArray } = require('./utils/toarray.js');
const fse = require('fs-extra');

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
    // Send the images as JSON response
    res.status(200).json(images);
  } catch (err) {
    console.error('Error retrieving images:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//Endpoint to create a new OCR Record
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
    fse.emptyDir('./uploads', err => {
      if (err) {
        console.error('Error emptying uploads folder:', err);
      } else {
        console.log('uploads folder emptied successfully');
      }
    });
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


//routes
//get all data
app.get('/data', async (req, res) => {
  try {
    const data = await datahandle.find().select('-__v -_id').exec();
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

//delete specific data
app.delete('/data/remove/:id', async(req, res) => {
  const id = req.params.id;
  try {
    const data = await datahandle.findOne({ idNumber: id });
    if (!data) {
      return res.status(404).send('Data not found');
    } else {
      // Modify the status before saving it back
      data.status = 'Deleted';
      // Use the save method to update the document
      await data.save();
      await datahandle.findOneAndDelete({ idNumber: id });
      return res.status(200).json('Data deleted successfully')
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

//update data
app.patch('/data/update/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const data = await datahandle.findOneAndUpdate({ idNumber: id }, req.body, { new: true, runValidators: true });

    if (!data) {
      return res.status(404).json({
        status: 'fail',
        message: 'Data not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        datahandle: data
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message
    });
  }
});

app.get('/data/search', async (req, res) => {
  const type = req.query.type;
  const value = req.query.value;
  console.log(type,value,typeof value);
  try{
    let data;
    if(type==="idNumber"){
      data = await datahandle.find({idNumber:value}).select('-__v -_id').exec();
    }
    else{
      data = await datahandle.find({type:/value$/}).select('-__v -_id').exec();
    }
    console.log((data));
    return res.status(200).json(data);
  }catch(err){
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});