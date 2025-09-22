import { getActiveChromeTab, getChromeTabs } from "tabnab";
import yargs from 'yargs';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = yargs(
    process.argv.slice(2)
)
    .option('url', {
        alias: 'u',
        description: 'The URL of the tab',
        type: 'string',
    })
    .option('instructions', {
        alias: 'i',
        description: 'Instructions to send to the AI',
        type: 'string',
    })
    .help()
    .alias('help', 'h')
    .argv;


function stripSource(source) {
    // remove any script tags entirely
    // allow multiple lines
    source = source.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // remove any style tags entirely
    // source = source.replace(/<style.*?>.*?<\/style>/mg, '');
    source = source.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // remove any comments
    source = source.replace(/<!--.*?-->/g, '');

    // remove any doctype
    source = source.replace(/<!DOCTYPE.*?>/g, '');

    // strip all html tags
    source = source.replace(/<[^>]*>/g, ' ');
    source = source.replace(/&nbsp;/g, ' ');
    source = source.replace(/&amp;/g, '&');
    source = source.replace(/&lt;/g, '<');
    source = source.replace(/&gt;/g, '>');
    source = source.replace(/&quot;/g, '"');
    source = source.replace(/&apos;/g, "'");

    // replace extra space
    source = source.replace(/\s+/g, ' ');

    return source;
}

async function summarizeTab(tab, instructions) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const rawSource = await tab.getHtmlSource();
    const source = stripSource(rawSource);

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": instructions
            },
            {
                "role": "user",
                "content": [
                    `Page title: ${tab.title}`,
                    `Page URL: ${tab.url}`,
                    `---`,
                    `Page source: ${source}`
                ].join('\n')
            }
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
    });

    return response.choices[0].message.content;
}


const tab = argv.url ?
    await getActiveChromeTab().find(tab => tab.url.toString() === argv.url) :
    await getActiveChromeTab();

// if (!argv.url) {
//     tab = await getActiveChromeTab();
// } else {
//     const tabs = await getChromeTabs();
//     tab = tabs.find(tab => tab.url.toString() === argv.url);
// }

// getChromeTabs().then(async tabs => {
//     const tab = tabs.find(tab => tab.url.toString() === argv.url);

if (!tab) {
    console.log('Tab not found');
    exit(1);
}

// make relative to this dir
// const intructionsPath = path.resolve(path.dirname(__filename), argv.instructions);
const instructionRelFileName = argv.instructions ?? 'summary';
const instructionPath = path.resolve(__dirname, `instructions/${instructionRelFileName}.txt`);
const instructions = fs.readFileSync(instructionPath, 'utf8');

await summarizeTab(tab, instructions).then(console.log);
