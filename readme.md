# ID OCR Application

An OCR (Optical Character Recognition) App that can recognize thai id cards and get the required information. Save this information for retrival later.

## Installation 

Instructions on how to install the project, for example:

```bash
    git clone https://github.com/furiousluck/Qoala-Assignment.git
    cd Qoala-Assignment
    npm install
    prepare your .env file with the required variables(see .env.example)
    npm start
```

## Deployment

- Deployed on Render
- [Link](https://id-ocr-application.vercel.app/)
- Note: The app is deployed on a free tier, so it might take some time to load the first time.

## Demo


https://github.com/furiousluck/ID-OCR-Application/assets/79402080/ea3d01f2-a93c-4a94-8926-dff58ed58be3



## Features

- NoSql database: MongoDB (mongoose)
- Used Google Vision API along with Google Gemini API to detect text in the images
- Used Google Translate API to translate the text to English
- Environment variables using dotenv
- It utilizes Optical Character Recognition (OCR) to analyze thai id cards and extract relevant data.
- CRUD api to create the ocr data, if needed we can modify some data, filter them or delete certain id cards(soft delete).

## API Reference

**List of the routes:**
- GetAllData: POST /data/
- DeleteData: DELETE /data/remove/:id
- UpdateData: PATCH /data/update/:id
- SearchData: GET /data/search?type={type}&value={value}
- UploadData: POST /upload
- GetImage: GET /images

## Tech Stack
- Node.js
- Express.js
- MongoDB
- Google Vision API
- Google Gemini API

## Authors
- [Adarsh Singh](https://github.com/furiousluck)


