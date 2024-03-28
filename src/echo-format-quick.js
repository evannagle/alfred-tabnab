import yargs from 'yargs';

import { getActiveChromeTab } from "tabnab"
import { formatTab, formats } from "./format.js";

const argv = yargs(
    process.argv.slice(2)
)
    .option('format', {
        alias: 'f',
        description: 'The format to convert the tabs to',
        type: 'string',
        choices: formats
    })
    .help()
    .alias('help', 'h')
    .argv;


getActiveChromeTab().then(tab => {
    console.log(formatTab({
        format: argv.format,
        url: tab.url,
        title: tab.title
    }));
});