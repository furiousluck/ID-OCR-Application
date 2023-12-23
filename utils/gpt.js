const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType
      },
    };
  }

async function run(img) {
    // For text-and-image input (multimodal), use the gemini-pro-vision model
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const prompt = "extract id number, name, last name, date of birth, date of issue and date of expiry from the given image in english";
    const imageParts = [
        img
      ];
    
    const result = await model.generateContent([prompt,...imageParts]);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    return text;
  }
  
module.exports = {run}
