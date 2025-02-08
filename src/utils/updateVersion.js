const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yaml = require('js-yaml');
const semver = require('semver');

async function getVersion(projectName) {
    // 获取当前版本号
    const url = `https://api.devsapp.cn/v3/packages/${projectName}/release/latest`
    const result = await axios.get(url);
    const version = result.data.body.tag_name;
    return version;
}

const updateVersion = async (descriptionData, descriptionPath) => {
    const projectName = descriptionData.Name;
    try {
        const currentVersion = await getVersion(projectName);
        const semverType = process.env.SEMVER_TYPE;
    
        // 计算出下一个版本的版本号
        descriptionData.Version = semver.inc(currentVersion, semverType);
    } catch (error) {
        descriptionData.Version = '0.0.1'
    }
    const updateDescript = yaml.dump(descriptionData, {
        lineWidth: -1, // 防止自动换行
        noRefs: true   // 移除引用
    })
    // 更改description.yml中的版本号
    await fs.writeFileSync(descriptionPath, updateDescript, 'utf8');
    return descriptionData
}

module.exports = updateVersion;