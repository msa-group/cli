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
  .option('-z, --zip <name>', 'The name of the zip ', '')
  .action(async (cmdObj) => {
    const { name } = cmdObj;
    const upload = require('../src/commands/upload');
    await upload(name);
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
  .option('-f, --file <file>', 'The entry yaml file to serve')
  .action((options) => {
    process.env.MSA_ENTRY_FILE = options.file || 'msa.yml';
    require('../src/commands/serve');
  });

program.parse(process.argv);
