
export const formatMap = {
    'markdown-link': ({ url, title }) => `[${title}](${url})`,
    'markdown-reference': ({ url, title }) => `[${title}][${url}]`,
    'markdown-reference-definition': ({ url, title }) => `[${url}]: ${title}`,
    'html-link': ({ url, title }) => `<a href="${url}">${title}</a>`,
    'html-reference': ({ url, title }) => `<a href="${url}" title="${title}">${title}</a>`,
    'html-reference-definition': ({ url, title }) => `<a href="${url}" title="${title}">${url}</a>`,
    'json': ({ url, title }) => JSON.stringify({ url, title }),
    'url': ({ url }) => url,
    'title': ({ title }) => title,
};

export const formats = Object.keys(formatMap);

export function formatTab({ format, url, title }) {
    if (!formatMap[format]) {
        throw new Error(`Unknown format: ${format}`);
    }

    return formatMap[format]({ url, title });
}
