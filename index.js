#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const _ = require('lodash');
const { program } = require('commander');

program
  .command('publish')
  .description('publish an external description.yaml into the internal publish.yaml')
  .action((options) => {
    // 定义路径
    const descriptionPath = path.resolve(process.cwd(), 'description.yaml');
    const packagePublishPath = path.resolve(__dirname, 'publish.yaml');
    const outputPath = path.resolve(process.cwd(), output); // 合并后的输出文件

		if (!fs.existsSync(path.resolve(process.cwd(), 'src'))) {
			fs.mkdirSync(path.resolve(process.cwd(), 'src'));
		}

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

      // 读取并解析 description.yaml
      const descriptionFile = fs.readFileSync(descriptionPath, 'utf8');
      const descriptionData = yaml.load(descriptionFile);

      // 读取并解析 包内的 publish.yaml
      const publishFile = fs.readFileSync(packagePublishPath, 'utf8');
      const publishData = yaml.load(publishFile);

      // 深度合并 descriptionData 到 publishData
      const mergedData = _.merge({}, publishData, descriptionData);

      // 将合并后的数据转换回YAML格式
      const mergedYaml = yaml.dump(mergedData, { 
        lineWidth: -1, // 防止自动换行
        noRefs: true   // 移除引用
      });

      // 将合并后的YAML写入新的文件
      fs.writeFileSync(outputPath, mergedYaml, 'utf8');

      console.log(`成功将 ${description} 合并到内部 publish.yaml，结果已保存到 ${output}`);
    } catch (e) {
      console.error('合并YAML文件时出错:', e.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
