import cheerio from 'cheerio';

export const scrapeWebsite = async (url: string) => {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  return {
    title: $('title').text(),
    content: $('main').text() || $('body').text()
  };
}; 