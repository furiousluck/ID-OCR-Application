function convertStringtoJSON(inputString){
    
    const lines = inputString.split('\n') || "NA";
    const idNumber = lines[0].split(': ')[1].trim()|| "NA";
    const name = lines[1].split(': ')[1].trim()|| "NA";
    const lastName = lines[2].split(': ')[1].trim()|| "NA";
    const dateOfBirth = lines[3].split(': ')[1].trim()|| "NA";
    const dateOfIssue = lines[4].split(': ')[1].trim()|| "NA";
    const dateOfExpiry = lines[5].split(': ')[1].trim()|| "NA";
    // if (idNumber === "NA" || name === "NA" || lastName === "NA" || dateOfBirth === "NA" || dateOfIssue === "NA" || dateOfExpiry === "NA") {
    //     return "NA";
    // }
    const jsonData = {
        "identification_number": idNumber,
        "name": name,
        "last_name": lastName,
        "date_of_birth": (dateOfBirth),
        "date_of_issue": (dateOfIssue),
        "date_of_expiry": (dateOfExpiry)
    };

    return jsonData;
}

module.exports = {convertStringtoJSON}