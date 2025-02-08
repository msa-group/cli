const fs = require("fs");
const axios = require("axios");
const path = require("path");

async function getReadme(projectName) {
    // 获取已发布的readme内容
    const url = `https://api.devsapp.cn/v3/packages/${projectName}/release/latest`
    const result = await axios.get(url);
    const readme_zh = result.data.body.readme;
    const result_en = await axios.get(`${url}?lang=en`);
    const readme_en = result_en.data.body.readme;
    return {
        zh: readme_zh,
        en: readme_en
    };
}

 async function reuseReadme(descriptionData){
    const projectName = descriptionData.Name;
    const readmePath = path.resolve(process.cwd(), 'readme.md');
    const readmePath_en = path.resolve(process.cwd(), 'readme_en.md');
    // 如果 readme_en.md 文件存在，则说明已完成生成，不需要补齐
    if (fs.existsSync(readmePath)) {
        return;
    }
    try {
        const originReadme = await getReadme(projectName);
        fs.writeFileSync(readmePath, originReadme.zh);
        fs.writeFileSync(readmePath_en,originReadme.en)
    } catch (e) {
        console.log(e.message);
    }
 }

module.exports = reuseReadme;