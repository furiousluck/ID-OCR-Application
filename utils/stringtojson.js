function convertStringtoJSON(inputString){
    
    const lines = inputString.split('\n');
    const idNumber = lines[0].split(': ')[1].trim();
    const name = lines[1].split(': ')[1].trim();
    const lastName = lines[2].split(': ')[1].trim();
    const dateOfBirth = lines[3].split(': ')[1].trim();
    const dateOfIssue = lines[4].split(': ')[1].trim();
    const dateOfExpiry = lines[5].split(': ')[1].trim();
    // if (idNumber === "NA" || name === "NA" || lastName === "NA" || dateOfBirth === "NA" || dateOfIssue === "NA" || dateOfExpiry === "NA") {
    //     return "NA";
    // }
    const jsonData = {
        "identification_number": idNumber,
        "name": name,
        "last_name": lastName,
        "date-of-birth": (dateOfBirth),
        "date-of-issue": (dateOfIssue),
        "date-of-expiry": (dateOfExpiry)
    };

    return jsonData;
}

module.exports = {convertStringtoJSON}