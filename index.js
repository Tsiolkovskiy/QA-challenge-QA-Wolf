const { chromium } = require("playwright");

async function saveHackerNewsArticles() {
  try {
    // Launch browser with specific executable path
    const browser = await chromium.launch({
      headless: true,
      // executablePath: 'C:\\Program Files\\Chromium\\chrome.exe' // Uncomment and update this path if needed
    });
    console.log("Browser launched successfully");
    const context = await browser.newContext();
    const page = await context.newPage();

    // Go to Hacker News
    await page.goto("https://news.ycombinator.com/newest");
    console.log("Navigated to Hacker News");

    // Extract article data
    const articles = await page.evaluate(() => {
      const rows = document.querySelectorAll('.athing');
      const getTime = (timeStr) => {
        const now = new Date();
        const [value, unit] = timeStr.split(' ');
        const amount = parseInt(value);
        switch (unit) {
          case 'minute':
          case 'minutes':
            now.setMinutes(now.getMinutes() - amount);
            break;
          case 'hour':
          case 'hours':
            now.setHours(now.getHours() - amount);
            break;
          case 'day':
          case 'days':
            now.setDate(now.getDate() - amount);
            break;
          case 'month':
          case 'months':
            now.setMonth(now.getMonth() - amount);
            break;
          case 'year':
          case 'years':
            now.setFullYear(now.getFullYear() - amount);
            break;
          default:
            return null;
        }
        return now;
      };

      let data = [];
      rows.forEach(row => {
        const titleElement = row.querySelector('.storylink');
        const ageElement = row.nextElementSibling ? row.nextElementSibling.querySelector('.age') : null;

        if (titleElement && ageElement) {
          const title = titleElement.innerText;
          const timeStr = ageElement.innerText;
          const date = getTime(timeStr);
          if (date) {
            data.push({ title, date });
          }
        }
      });
      return data;
    });

    // Sort articles by date
    articles.sort((a, b) => b.date - a.date);

    // Check if articles are sorted by date
    let sorted = true;
    for (let i = 1; i < articles.length; i++) {
      if (articles[i].date > articles[i - 1].date) {
        sorted = false;
        break;
      }
    }

    console.log(`Are articles sorted by date: ${sorted}`);
    if (!sorted) {
      console.log(articles.map(article => `${article.title} - ${article.date}`));
    }

    await browser.close();
    console.log("Browser closed successfully");
  } catch (err) {
    console.error("Error occurred:", err);
  }
}

(async () => {
  await saveHackerNewsArticles();
})();