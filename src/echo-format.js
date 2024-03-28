import yargs from 'yargs';
import { formatTab, formats } from './format.js';

const argv = yargs(
    process.argv.slice(2)
)
    .option('format', {
        alias: 'f',
        description: 'The format to convert the tabs to',
        type: 'string',
        choices: formats
    })
    .option('url', {
        alias: 'u',
        description: 'The URL of the tab',
        type: 'string',
    })
    .option('title', {
        alias: 't',
        description: 'The title of the tab',
        type: 'string',
    })
    .help()
    .alias('help', 'h')
    .argv;

console.log(formatTab({
    format: argv.format,
    url: argv.url,
    title: argv.title
}));