const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/build-pdf', async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) {
      return res.status(400).json({ error: 'Missing HTML content' });
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const htmlWithStyles = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
      @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap");
      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
      @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");
      </style>
      <script>
      tailwind.config = {
          theme: {
              extend: {
                  fontFamily: {
                      jakarta: ["Plus Jakarta Sans", "sans-serif"],
                      inter: ["Inter", "sans-serif"],
                      roboto: ["Roboto", "sans-serif"],
                  },
                  colors: {
                      primary: "#2B2F37"
                  }
              }
          }
      }
    </script>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

    await page.setContent(htmlWithStyles);
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    res.setHeader('Content-Disposition', `attachment; filename="report.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 0,
      message: 'An error occurred while generating the PDF',
      error,
      messageTwo: error.message,
    });
  }
  res.json({ message: 'PDF generated successfully' });
});

app.listen(1001, () => console.log(`Running on port 1001`));
