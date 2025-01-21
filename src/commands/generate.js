
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yaml = require('js-yaml');

const apiKey = process.env.BAILIAN_API_KEY;
const appId = process.env.BAILIAN_APP_ID;

const outputZhPath = path.resolve(process.cwd(), 'readme.md');
const outputEnPath = path.resolve(process.cwd(), 'readme_en.md');
const inputPath = path.resolve(process.cwd(), 'description.yml');

// 提取description.yml 的 project 信息
async function getProject() {
    try {
        const descriptionContent = fs.readFileSync(inputPath, 'utf8');
        const description = yaml.load(descriptionContent);
        const project = description.Project;
        if (!project) {
            console.error('description.yml中不存在 Project 节点，无法生成 Readme');
            process.exit(1);
        }
        delete description.Project;
        const deletedYaml = yaml.dump(description, {
            lineWidth: -1, // 防止自动换行
            noRefs: true   // 移除引用
        })
        fs.writeFileSync(inputPath, deletedYaml, 'utf8');
        return project;
    } catch (e) {
        console.error('解析description.yml出错：', e.message);
        process.exit(1);
    }
   
}
async function callDashScope(project) {
    const syamlPath = path.resolve(process.cwd(), 'msa.yml')
    const syamlContent = fs.readFileSync(syamlPath, 'utf8');

    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;
    const data = {
        input: {
            prompt: "你是谁",
            biz_params: {
                project: JSON.stringify(project),
                syaml: syamlContent
            }
        },
        parameters: {},
        debug: {}
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (error) {
        console.error(`Error calling DashScope: ${error.message}`);
        if (error.response) {
            console.error(`Response status: ${error.response.status}`);
            console.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }
}
async function main() {
    const project = await getProject();
    const response = await callDashScope(project);
    if (response.status === 200) {
        try {
            const result = JSON.parse(response.data.output.text);
            fs.writeFileSync(outputZhPath, result.zh);
            console.log('readme.md generated successfully!');
    
            fs.writeFileSync(outputEnPath, result.en);
            console.log('readme_en.md generated successfully!');
        } catch (e) {
          console.error('写入文章时出错：', e.message);
          process.exit(1);
        }
    } else {
      console.error(`调用百炼服务出错，
        message:${response.data.message},
        request_id:${response.headers['request_id']}`);
      process.exit(1);
    }
}

main();