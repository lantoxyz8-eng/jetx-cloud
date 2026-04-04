const express = require('express');
const bodyParser = require('body-parser');
const { chromium } = require('playwright');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

let browser;
let page;
let multipliers = [];
let interval;

(async () => {
    browser = await chromium.launch({
        headless: false,
        slowMo: 50
    });
})();

// START
app.post('/start', async (req, res) => {
    const url = req.body.url;

    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    console.log("👉 Clique sur Accepter et entre dans le jeu (15s)");
    await page.waitForTimeout(15000);

    interval = setInterval(async () => {
        try {
            let values = await page.evaluate(() => {
                let els = document.querySelectorAll('*');
                let nums = [];

                els.forEach(el => {
                    if (el.innerText && el.innerText.includes('x')) {
                        let v = parseFloat(el.innerText.replace('x',''));
                        if (!isNaN(v)) nums.push(v);
                    }
                });

                return nums.slice(-50);
            });

            multipliers = values;

        } catch {}
    }, 2000);

    res.send({ status: "STARTED" });
});

// DATA
app.get('/data', (req, res) => {
    res.json({ multipliers });
});

// STOP
app.post('/stop', (req, res) => {
    if (interval) clearInterval(interval);
    res.send({ status: "STOPPED" });
});

app.listen(3000, '0.0.0.0', () => {
    console.log("Server running on 3000");
});