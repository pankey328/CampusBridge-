const pdfModule = require('pdf-parse');
const PDFParser = require('pdf2json');

// Extract plain text from a PDF buffer.
async function extractTextFromPdf(buffer) {
  if (!buffer || buffer.length === 0) return '';
  console.log('PDF buffer size:', buffer.length, 'bytes');

  // Try pdf-parse v2 (PDFParse class) or v1 (function)
  try {
    if (typeof pdfModule === 'function') {
      const data = await pdfModule(buffer);
      if (data && data.text) return data.text.trim();
    } else if (pdfModule && pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const result = await parser.getText();
      const text = typeof result === 'string' ? result : (result?.text || '');
      if (text.trim().length > 0) {
        return text.trim();
      }
    }
  } catch (err) {
    console.error('pdf-parse extraction error:', err.message || err);
  }

  // Fallback to pdf2json
  try {
    return await new Promise((resolve) => {
      const parser = new PDFParser();
      parser.on('pdfParser_dataError', error => {
        console.error('pdf2json extraction error:', error?.parserError || error);
        resolve('');
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
          resolve(text.trim());
        } catch (e) {
          console.error('Error processing pdf2json data:', e);
          resolve('');
        }
      });
      parser.parseBuffer(buffer);
    });
  } catch (fallbackErr) {
    console.error('Fallback PDF extraction error:', fallbackErr.message || fallbackErr);
    return '';
  }
}

module.exports = { extractTextFromPdf };

