const chalk = require('chalk');
const _ = require('lodash');
const minimist = require('minimist');
const { formatGhostGreeting } = require('./utils');

const argv = minimist(process.argv.slice(2));

function runGhostApp() {
  const greeting = formatGhostGreeting(argv.name || 'Wanderer');
  console.log(chalk.green(greeting));

  const items = [1, 2, 3, 4, 5, 6];
  const chunked = _.chunk(items, 2);
  console.log(chalk.cyan('Chunked haunted tokens:'), chunked);
}

runGhostApp();
