
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const _ = require('lodash');
const updateVersion = require('../utils/updateVersion');
const reuseReadme = require('../utils/reuseReadme');

function getFilePath(dir, fileName) {
  const yamlPath = path.resolve(dir, `${fileName}.yaml`);
  const ymlPath = path.resolve(dir, `${fileName}.yml`);

  if (fs.existsSync(yamlPath)) {
    return yamlPath;
  } else if (fs.existsSync(ymlPath)) {
    return ymlPath;
  } else {
    throw new Error(`文件 ${fileName}.yaml 或 ${fileName}.yml 不存在`);
  }
}

// 定义路径
const descriptionPath = getFilePath(process.cwd(), 'description');
const packagePublishPath = getFilePath(__dirname, '../publish');
const msaFilePath = getFilePath(process.cwd(), 'msa');
const outputPath = path.resolve(process.cwd(), 'publish.yaml'); // 合并后的输出文件

// 创建 src 目录
if (!fs.existsSync(path.resolve(process.cwd(), 'src'))) {
  fs.mkdirSync(path.resolve(process.cwd(), 'src'));
}

async function main() {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(descriptionPath)) {
      console.error(`文件不存在: ${descriptionPath}`);
      process.exit(1);
    }
    if (!fs.existsSync(packagePublishPath)) {
      console.error(`内部 publish.yaml 文件不存在: ${packagePublishPath}`);
      process.exit(1);
    }
    if (!fs.existsSync(msaFilePath)) {
      console.error(`msa.yaml 文件不存在: ${msaFilePath}`);
      process.exit(1);
    }

    // 将 msa.yaml cp 到 src 下， 并改名为 s.yaml
    fs.copyFileSync(msaFilePath, path.resolve(process.cwd(), 'src', 's.yaml'));

    // 读取并解析 description.yaml
    const descriptionFile = fs.readFileSync(descriptionPath, 'utf8');
    const descriptionData = yaml.load(descriptionFile);
    const updateDescripData = await updateVersion(descriptionData, descriptionPath);

    // 判断readme文件是否需要复用已有文件
    await reuseReadme(descriptionData);

    // 读取并解析 包内的 publish.yaml
    const publishFile = fs.readFileSync(packagePublishPath, 'utf8');
    const publishData = yaml.load(publishFile);

    // 深度合并 descriptionData 到 publishData
    const mergedData = _.merge({}, publishData, updateDescripData);

    // 将合并后的数据转换回YAML格式
    const mergedYaml = yaml.dump(mergedData, {
      lineWidth: -1, // 防止自动换行
      noRefs: true   // 移除引用
    });

    // 将合并后的YAML写入新的文件
    fs.writeFileSync(outputPath, mergedYaml, 'utf8');

    console.log(`成功将 description.yaml 合并到内部 publish.yaml，结果已保存到 ${outputPath}`);
  } catch (e) {
    console.error('合并YAML文件时出错:', e.message);
    process.exit(1);
  }
}

main()