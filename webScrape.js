const request = require("request-promise")
const cheerio = require("cheerio")


const extractTitles = $ => [
    ...new Set(
        $(".headline").map((_, a) => $(a).attr("aria-label")).toArray()
    ),
];

const extractPublishDates = $ => [
    ...new Set(
        $(".format-distance-to-now").map((_, a) => $(a).attr("datetime")).toArray()
    ),
];

function sortArticlesByDate(a, b) {
    return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getAllArticles() {
    const articlesTemp = [];
    return new Promise(resolve => {
        request("https://www.vg.no/", (error, response, body) => {
            if(!error && response.statusCode == 200) {
                const $ = cheerio.load(body);
                
    
                const titles = extractTitles($);
                const publishDates = extractPublishDates($);
                publishDates.forEach((date, index) => {
    
                    article = {"title":titles[index], "datetime":date};
                    articlesTemp.push(article);
                });
    
                articlesTemp.sort(sortArticlesByDate);     
            }
        });
        resolve(articlesTemp);
    })
}

async function main() {
    const articles = await getAllArticles();
    await sleep(2000);

    articles.forEach((article) => {
        console.log(article);
    });


    while (true)
    {
        console.log("Sjekker etter nye artikler...");
        const articlesTemp = await getAllArticles();
        await sleep(2000);

        articlesTemp.forEach((articleTemp) => {
            isNew = true;
            articles.forEach((article) => {
                if (articleTemp.title == article.title){
                    isNew = false;
                }
            });
            if (isNew){
                articles.push(articleTemp);
                console.log(articleTemp);
            }
        });

        await sleep(10000);
    }
}

main();