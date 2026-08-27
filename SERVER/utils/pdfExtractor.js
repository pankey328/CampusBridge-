const pdfParse = require('pdf-parse');
const PDFParser = require('pdf2json');


// Extract plain text from a PDF buffer.
async function extractTextFromPdf(buffer) {
  console.log('PDF buffer size:', buffer.length, 'bytes');
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('pdf-parse extraction error:', err);
    console.log('Attempting fallback extraction with pdf2json');
    return new Promise((resolve, reject) => {
      const parser = new PDFParser();
      parser.on('pdfParser_dataError', error => {
        console.error('pdf2json extraction error:', error);
        reject(new Error('Failed to extract text from PDF resume.'));
      });
      parser.on('pdfParser_dataReady', data => {
        try {
          const pages = data?.formImage?.Pages || [];
          const text = pages
            .map(page =>
              (page.Texts || [])
                .map(t => decodeURIComponent(t.R[0].T))
                .join(' ')
            )
            .join('\n');
          resolve(text);
        } catch (e) {
          console.error('Error processing pdf2json data:', e);
          reject(new Error('Failed to extract text from PDF resume.'));
        }
      });
      parser.parseBuffer(buffer);
    });
  }
}

module.exports = { extractTextFromPdf };
