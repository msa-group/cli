
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const readmePath = path.resolve(process.cwd(), 'README.md');
const outputPath_zh = path.resolve(process.cwd(), 'readme.md');
const outputPath_en = path.resolve(process.cwd(), 'readme_en.md')

module.exports = async function (url) {
    const descriptionContent = fs.readFileSync(readmePath, 'utf8');
    if (!descriptionContent) {
        console.error('不存在原始 README.md 文件，无法生成 Readme');
        process.exit(1);
    }
    if (!url) {
        console.error('Error: URL is required. Use -u or --url to specify the FC service URL.');
        process.exit(1);
    }
    console.log(`Generating README files using FC service at: ${url}`);
    try {
        // 发送 POST 请求到指定的 FC 服务 URL
        const response = await axios.post(url, {
            descriptionContent: descriptionContent,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 600000, // 设置超时时间（毫秒）
        });
        console.log('FC 函数响应:', response.data);
        fs.writeFileSync(outputPath_zh, response.data.zh, 'utf8');
        fs.writeFileSync(outputPath_en, response.data.en, 'utf8');
    } catch (error) {
        if (error.response) {
            // 服务器响应了状态码，但状态码不是2xx
            console.error('HTTP 错误响应:', error.response.status, error.response.data);
        } else if (error.request) {
            // 请求已发送但未收到响应
            console.error('未收到响应:', error.request);
        } else {
            // 其他错误
            console.error('请求错误:', error.message);
        }
        process.exit(1);
    }
 }
