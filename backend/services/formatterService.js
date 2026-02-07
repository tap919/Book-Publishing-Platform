/**
 * Manuscript Formatter Service
 * Automates manuscript formatting for print and digital
 */
class FormatterService {
  /**
   * Format manuscript for print (PDF)
   */
  formatForPrint(manuscriptText, options = {}) {
    const {
      trimSize = '6x9',
      fontFamily = 'Garamond',
      fontSize = 11,
      lineSpacing = 1.5,
      margins = { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 },
      includeHeaders = true,
      includePageNumbers = true,
    } = options;

    // In production, use a library like pdfkit or similar
    return {
      success: true,
      format: 'print-ready-pdf',
      trimSize,
      settings: {
        fontFamily,
        fontSize,
        lineSpacing,
        margins,
        includeHeaders,
        includePageNumbers,
      },
      estimatedPageCount: this.calculatePageCount(manuscriptText, fontSize, trimSize),
    };
  }

  /**
   * Format manuscript for EPUB
   */
  formatForEpub(manuscriptText, metadata) {
    // Convert to EPUB structure
    return {
      success: true,
      format: 'epub',
      metadata: {
        title: metadata.title,
        author: metadata.author,
        language: metadata.language || 'en',
        publisher: metadata.publisher,
      },
      chapters: this.extractChapters(manuscriptText),
    };
  }

  /**
   * Extract chapters from manuscript
   */
  extractChapters(text) {
    // Simple chapter detection based on "Chapter" keyword
    const chapterRegex = /Chapter\s+(\d+|[IVXLCDM]+)[\s:]/gi;
    const matches = [...text.matchAll(chapterRegex)];
    
    const chapters = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = matches[i + 1]?.index || text.length;
      chapters.push({
        number: i + 1,
        title: matches[i][0].trim(),
        content: text.substring(start, end).trim(),
      });
    }

    return chapters.length > 0 ? chapters : [{ number: 1, title: 'Full Text', content: text }];
  }

  /**
   * Calculate estimated page count
   */
  calculatePageCount(text, fontSize, trimSize) {
    const wordsPerPage = {
      '5x8': 250,
      '6x9': 300,
      '8.5x11': 400,
    };

    const words = text.split(/\s+/).length;
    const avgWordsPerPage = wordsPerPage[trimSize] || 300;
    
    return Math.ceil(words / avgWordsPerPage);
  }

  /**
   * Validate manuscript format
   */
  validateManuscript(file) {
    const validFormats = ['.doc', '.docx', '.txt', '.pdf', '.rtf'];
    const ext = file.originalname.toLowerCase().match(/\.[^.]+$/)?.[0];

    if (!validFormats.includes(ext)) {
      return {
        valid: false,
        error: `Invalid format. Accepted formats: ${validFormats.join(', ')}`,
      };
    }

    // Check file size (max 50MB)
    if (file.size > 52428800) {
      return {
        valid: false,
        error: 'File size exceeds 50MB limit',
      };
    }

    return { valid: true };
  }

  /**
   * Auto-correct common manuscript issues
   */
  autoCorrect(text) {
    let corrected = text;

    // Fix multiple spaces
    corrected = corrected.replace(/\s{2,}/g, ' ');

    // Fix quotation marks
    corrected = corrected.replace(/"([^"]*)"/g, '"$1"');

    // Fix ellipsis
    corrected = corrected.replace(/\.{3,}/g, '…');

    // Fix em dashes
    corrected = corrected.replace(/--/g, '—');

    return corrected;
  }
}

module.exports = new FormatterService();
