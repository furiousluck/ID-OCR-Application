const fs = require("fs");
const path = require("path");
const { run } = require("../utils/gpt.js");
const { convertStringtoJSON } = require("../utils/stringtojson.js");
const { toArray } = require("../utils/toarray.js");
const imgSchema = require("../model/model.js");
const datahandle = require("../model/data-model.js");
const fse = require("fs-extra");

const getAllImages = async (req, res) => {
  try {
    const images = await imgSchema.find();
    res.status(200).json(images);
  } catch (err) {
    console.error("Error retrieving images:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const uploadImage = async (req, res) => {
  try {
    console.log(req.file);
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
    if (x1 == 0) {
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
        if (x1 === 1) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.write(JSON.stringify(jsonData));
          console.log("Data inserted: ", item);
        } else {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.write(JSON.stringify({ error: "Blurry Image.Retry Again!!" }));
        }
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
  }
};

module.exports = {getAllImages,uploadImage};
