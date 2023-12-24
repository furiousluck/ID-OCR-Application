const express = require('express');
const app = express();
const multer = require('multer');
const mongoose = require('mongoose');
const GridfsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
require('dotenv').config();


app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');



const mongoURI = process.env.MONGO_URI;
const conn = mongoose.createConnection(mongoURI);
//init gfs
let gfs;

conn.once('open', () => {
    //init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

//create storage engine



