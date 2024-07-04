const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require("mongoose");
const ocrRoutes = require("./routes/ocrRoutes");
const dataRoutes = require("./routes/dataRoutes");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { run } = require("./utils/gpt.js");
const { convertStringtoJSON } = require("./utils/stringtojson.js");
var imgSchema = require("./model/model.js");
const datahandle = require("./model/data-model.js");
const { toArray } = require("./utils/toarray.js");
const fse = require("fs-extra");
const cors = require("cors");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(console.log("DB Connected"));

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false, limit: "2mb" }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage }).single("avatar");
app.set("view engine", "ejs");

//routes
app.get("/", (req, res) => {
  res.render("index");
});

// Endpoint to retrieve all images with message
app.get("/images", async (req, res) => {
  try {
    const images = await imgSchema.find().select("-__v -_id").exec();
    // Send the images as JSON response
    res.status(200).json(images);
  } catch (err) {
    console.error("Error retrieving images:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/status", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

//Endpoint to create a new OCR Record
app.post("/upload", upload, async (req, res) => {
  try {
    console.log(req.file);
    if(!req.file){
      res.status(400).json({error:"Please upload a file"});
    }
    const result = await run(req.file.path, req.file.mimetype); // Pass the image path to the Gemini-Pro Vision function
    const jsonData = convertStringtoJSON(result);
    const checkdeddata = toArray(result);
    let x1 = 1;
    if (jsonData == "NA") {
      x1 = 0;
    }
    // Read the image file and convert it to base64
    const imageData = fs.readFileSync(
      path.join(__dirname, "/uploads/", req.file.filename)
    );
    const base64Image = Buffer.from(imageData).toString("base64");
    // console.log(base64Image);
    let x = "Data extracted successfully";
    let xx=0;
    if (x1 == 0) {
      for (let i = 0; i < checkdeddata.length; i++) {
        if (checkdeddata[i] == "NA") {
          checkdeddata[i] = "NA";
          xx++;
        }
      }
      if(xx>3)checkdeddata[7] = "Reject";
      x = "Blurry Image.Retry Again!!";
    }
    var obj = {
      desc: x,
      img: {
        data: base64Image,
        contentType: req.file.mimetype,
      },
    };
    var obj1 = {
      idNumber: checkdeddata[0],
      firstname: checkdeddata[1],
      lastName: checkdeddata[2],
      dateOfBirth: checkdeddata[3],
      dateOfIssue: checkdeddata[4],
      dateOfExpiry: checkdeddata[5],
      dateOfUpload: checkdeddata[6],
      status: checkdeddata[7],
    };
    datahandle.create(obj1);
    imgSchema
      .create(obj)
      .then((item) => {
        // Only redirect if the creation was successful
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(jsonData));
        console.log("Data inserted: ", item);
        // res.redirect('/');
      })
      .catch((err) => {
        console.log("Data not inserted: ", err);
        // Handle the error appropriately (send an error response, log, etc.)
      })
      .finally(() => {
        // Make sure to end the response after handling the async operation
        res.end();
        fse.emptyDir("./uploads", (err) => {
          if (err) {
            console.error("Error emptying uploads folder:", err);
          } else {
            console.log("uploads folder emptied successfully");
          }
        });
      });
    // res.json(jsonData); // Send the extracted information as JSON
  } catch (error) {
    console.error(error);
    res.setHeader(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Could not process image" }));
    if (process.exitCode !== null) {
      console.log("Restarting server...");
      process.exitCode = null; // Reset exitCode
      startServer(); // Call a function to start the server
    }
  }
});

app.use("/data", dataRoutes);

//to start server
const PORT = 5003 || process.env.PORT;
startServer();

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    server.close(() => {
      process.exit(1);
    });
  });
}
