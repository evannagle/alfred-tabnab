import { getChromeTabs } from "tabnab";
import yargs from 'yargs';
import { OpenAI } from 'openai';

const argv = yargs(
    process.argv.slice(2)
)
    .option('url', {
        alias: 'u',
        description: 'The URL of the tab',
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

async function summarizeTab(tab) {
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
                "content": `
                    Summarize the content your are provided to offer an insightful summary. Use a voice and diction that's similar to that used by the original author. The summary should be concise and informative. Include the following sections, which should be Markdown titles with "###" syntax and should follow standard Markdown linting syntax:

                    - Summary. A brief summary of the content. One to two sentences.
                    - Key Points. The essential points made on the page. Two to four bullet points.
                    - Links. Maximum of five links, as many as possible. Please try to offer at least three. This should include a list of links found in the document, formatted as markdown links. Do not include any links that are not explictly listed as a tags in the HTML.
                    - More Information. A list of any additional information that you know, which was not included in the article, that might be relevant to the reader.
                `
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


getChromeTabs().then(async tabs => {
    const tab = tabs.find(tab => tab.url.toString() === argv.url);

    if (!tab) {
        console.log('Tab not found');
        return;
    }

    console.log(await summarizeTab(tab));
});
