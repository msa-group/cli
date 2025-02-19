const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

module.exports = async function sendZip(name) {
    const FC_SERVICE = process.env.FC_SERVICE;
    const ZIP_PATH = name;
    console.log("====ZIP_PATH===", ZIP_PATH)

    if (!fs.existsSync(ZIP_PATH)) {
        console.error('Zip file not found:', ZIP_PATH);
        process.exit(1);
    }
  
    const form = new FormData();
    form.append('zipfile', fs.createReadStream(ZIP_PATH));
    console.log("开始传输 zip文件：", ZIP_PATH)

  
    try {
      const response = await axios.post(FC_SERVICE, form, {
        headers: form.getHeaders()
      });
      console.log('Success:', response.data);
    } catch (error) {
        console.error('Error sending file:', error.response?.data || error.message);
        process.exit(1);
    }
    
  }
  