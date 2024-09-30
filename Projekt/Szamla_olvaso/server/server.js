const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World from Node.js server!');
});

// Statikus fájlok kiszolgálása
app.use(express.static(path.join(__dirname, '../dist/szamla-olvaso')));

// Wildcard GET kérés kezelése
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/szamla-olvaso/browser/index.html'));
}); 


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});



