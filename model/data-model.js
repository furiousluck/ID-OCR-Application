var mongoose = require('mongoose');
var datahandle = new mongoose.Schema({
    idNumber: String,
    firstname: String,
    lastName: String,
    dateOfBirth: String,
    dateOfIssue: String,
    dateOfExpiry: String,
    dateOfUpload: String,
    status: String
});

module.exports = mongoose.model("Data", datahandle);