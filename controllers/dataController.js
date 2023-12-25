const datahandle = require("../model/data-model.js");

const getAllData = async (req, res) => {
  try {
    const data = await datahandle.find().select("-__v -_id").exec();
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const removeData = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await datahandle.findOne({ idNumber: id });
    if (!data) {
      return res.status(404).send("Data not found");
    } else {
      // Modify the status before saving it back
      data.status = "Deleted";
      // Use the save method to update the document
      await data.save();
      await datahandle.findOneAndDelete({ idNumber: id });
      return res.status(200).json("Data deleted successfully");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const updateData = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await datahandle.findOneAndUpdate({ idNumber: id }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!data) {
      return res.status(404).json({
        status: "fail",
        message: "Data not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        datahandle: data,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

const searchData = async (req, res) => {
  const type = req.query.type;
  const value = req.query.value;

  if (!type || !value) {
    return res.status(400).send("Bad Request: Missing type or value");
  }

  try {
    const query =
      type === "idNumber"
        ? { idNumber: value }
        : { [type]: new RegExp(value + "$") };
    const data = await datahandle.find(query).select("-__v -_id").exec();

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { getAllData, removeData, updateData, searchData };
