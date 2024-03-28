import { getChromeTabs } from "tabnab"

export function convertTabToAlfredOption(tab) {
    return {
        uid: tab.url,
        title: tab.title,
        subtitle: tab.url,
        arg: tab.url,
        variables: {
            url: tab.url,
            title: tab.title
        }
    };
}

getChromeTabs().then(tabs => {
    const data = {
        items: tabs.map(convertTabToAlfredOption)
    };

    console.log(JSON.stringify(data, null, 2));
})
