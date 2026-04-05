// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { chromium } = require('playwright'); // Playwright pour Linux

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // dossier public pour HTML/CSS/JS

// Endpoint simple pour test
app.get('/status', (req, res) => {
  res.json({ status: 'Server running 🚀' });
});

// Exemple de fonction pour récupérer les multiplicateurs JetX
app.get('/scrape', async (req, res) => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Remplace par ton URL JetX
    const jetxUrl = req.query.url || 'https://bet261.com/instant-games/em/jetx_smartsoft?categoryId=18';
    await page.goto(jetxUrl, { waitUntil: 'load', timeout: 60000 });

    // Exemple : récupérer multiplicateurs visibles sur la page
    const multipliers = await page.evaluate(() => {
      // À adapter selon la structure du site
      return Array.from(document.querySelectorAll('.multiplier')).map(el => parseFloat(el.textContent));
    });

    await browser.close();
    res.json({ multipliers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed', message: err.message });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});