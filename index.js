#!/usr/bin/env node

const { program } = require('commander');

program
  .command('publish')
  .description('publish an external description.yaml into the internal publish.yaml')
  .action(() => {
    require('./bin/mergeFile');
  });


program
  .command('dev')
  .description('The console of msa-engine server')
  .option('-f, --file <file>', 'The entry yaml file to serve')
  .action((options) => {
    process.env.MSA_ENTRY_FILE = options.file || 'msa.yml';
    require('./bin/serve');
  });

program.parse(process.argv);
