const express = require('express');
const multer = require('multer');
const pdf2htmlEX = require('pdf2htmlEX');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pdf.html'));
});

app.post('/upload', upload.single('pdf'), (req, res) => {
  if (!req.file || path.extname(req.file.originalname) !== '.pdf') {
    res.status(400).send('Please upload a PDF file.');
    return;
  }

  const pdfPath = req.file.path;
  const htmlPath = `${pdfPath}.html`;

  pdf2htmlEX(pdfPath, (err, html) => {
    if (err) {
      console.error('Error converting PDF to HTML:', err);
      res.status(500).send('Error converting PDF to HTML');
      return;
    }

    fs.writeFile(htmlPath, html, err => {
      if (err) {
        console.error('Error writing HTML file:', err);
        res.status(500).send('Error writing HTML file');
        return;
      }

      console.log(`PDF converted to HTML: ${htmlPath}`);
      res.sendFile(htmlPath, err => {
        if (err) {
          console.error('Error sending HTML file:', err);
          res.status(500).send('Error sending HTML file');
          return;
        }

        fs.unlinkSync(pdfPath);
        fs.unlinkSync(htmlPath);
      });
    });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
