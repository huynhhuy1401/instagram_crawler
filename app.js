const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

const loginInfo = {
  username: '',
  password: ''
}

const scrapeImages = async (username) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.instagram.com/accounts/login/');
  await page.waitFor(3000);

  await page.type('[name=username]', loginInfo.username);
  await page.type('[name=password]', loginInfo.password);
  await page.click('[type=submit]');
  await page.waitFor(5000);

  await page.goto(`https://www.instagram.com/${username}/`);
  await page.waitFor(5000);
  await page.waitForSelector('img', {
    visible: true
  });

  const data = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');

    const srcs = Array.from(imgs).map(v => v.src);

    return srcs;
  })

  await browser.close();

  return data;
}

const writeAsJSON = (data, username) => {
  const content = JSON.stringify(data);
  const filePath = path.join(__dirname, '/jsons', `/${username}_imgs.json`)
  fs.writeFileSync(filePath, content);
};

readline.question('Which user do you want to scrape? ', async username => {
  const imgUrls = await scrapeImages(username);
  writeAsJSON(Array.from(imgUrls), username);
  readline.close();
});
