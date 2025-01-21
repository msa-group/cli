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

const updateVersion = async (descriptionData, descriptionFile, semverType) => {
    const projectName = descriptionData.Name;
    const currentVersion = await getVersion(projectName);

    // 计算出下一个版本的版本号
    description.Version = semver.inc(currentVersion, semverType);
    const updateDescript = yaml.dump(description, {
        lineWidth: -1, // 防止自动换行
        noRefs: true   // 移除引用
    })
    // 更改description.yml中的版本号
    fs.writeFileSync(descriptionFile, updateDescript, 'utf8');
}

export default updateVersion;