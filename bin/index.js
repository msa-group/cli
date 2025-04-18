#!/usr/bin/env node

const { program } = require('commander');

program
  .command('publish')
  .description('publish an external description.yaml into the internal publish.yaml')
  .action(() => {
    require('../src/commands/publish');
  });

program
  .command('upload')
  .description('upload the project to oss')
  .option('-z, --zip <zip>', 'The name of the zip ', '')
  .action(async (cmdObj) => {
    console.log("cmdObj",JSON.stringify(cmdObj))
    const { zip } = cmdObj;
    const upload = require('../src/commands/upload');
    await upload(zip);
  });

program
  .command('generate')
  .description('generate readme.md and readme_en.md in the current directory')
  .option('-u, --url <url>', 'The url of the FC service', '')
  .action(async (cmdObj) => {
    const { url } = cmdObj
    const generate = require('../src/commands/generate');
    await generate(url);
  });


program
  .command('dev')
  .description('The console of msa-engine server')
  .action(() => {
    require('../src/commands/serve');
  });

program.parse(process.argv);
