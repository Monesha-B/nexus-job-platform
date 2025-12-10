const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Extract text from PDF file
 */
const extractTextFromPDF = async (fileBuffer) => {
  try {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF. The file may be corrupted or password-protected.');
  }
};

/**
 * Extract text from DOCX file
 */
const extractTextFromDOCX = async (fileBuffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to extract text from Word document.');
  }
};

/**
 * Extract text from file based on type
 */
const extractText = async (fileBuffer, fileType) => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
    case 'application/pdf':
      return extractTextFromPDF(fileBuffer);
    case 'docx':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractTextFromDOCX(fileBuffer);
    case 'doc':
    case 'application/msword':
      // For older .doc files, try mammoth (limited support)
      return extractTextFromDOCX(fileBuffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};

/**
 * Extract text from file URL (Cloudinary)
 */
const extractTextFromURL = async (fileUrl, fileType) => {
  try {
    // Download file from URL
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
    });
    
    const fileBuffer = Buffer.from(response.data);
    return extractText(fileBuffer, fileType);
  } catch (error) {
    console.error('Error downloading file from URL:', error);
    throw new Error('Failed to download and process file.');
  }
};

/**
 * Extract text from local file path
 */
const extractTextFromPath = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    return extractText(fileBuffer, ext);
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error('Failed to read file.');
  }
};

/**
 * Clean and normalize extracted text
 */
const cleanText = (text) => {
  if (!text) return '';
  
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters but keep punctuation
    .replace(/[^\w\s.,;:!?@#$%&*()\-+=\[\]{}|\\/<>'"]/g, '')
    // Trim
    .trim();
};

/**
 * Basic resume section detection (before AI parsing)
 */
const detectSections = (text) => {
  const sections = {
    contact: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
    certifications: '',
    projects: '',
    other: '',
  };

  // Common section headers
  const sectionPatterns = {
    contact: /^(contact|personal\s+info|information)/im,
    summary: /^(summary|objective|profile|about\s+me)/im,
    experience: /^(experience|work\s+history|employment|professional\s+experience)/im,
    education: /^(education|academic|qualifications)/im,
    skills: /^(skills|technical\s+skills|core\s+competencies|expertise)/im,
    certifications: /^(certifications?|licenses?|credentials)/im,
    projects: /^(projects?|portfolio|work\s+samples)/im,
  };

  // Simple section splitting (AI will do better parsing)
  const lines = text.split('\n');
  let currentSection = 'other';

  for (const line of lines) {
    const trimmedLine = line.trim().toLowerCase();
    
    // Check if line matches any section header
    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(trimmedLine)) {
        currentSection = section;
        break;
      }
    }
    
    sections[currentSection] += line + '\n';
  }

  return sections;
};

/**
 * Extract basic contact info using regex
 */
const extractBasicContactInfo = (text) => {
  const contact = {
    email: null,
    phone: null,
    linkedIn: null,
    github: null,
  };

  // Email pattern
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) contact.email = emailMatch[0];

  // Phone pattern (various formats)
  const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) contact.phone = phoneMatch[0];

  // LinkedIn
  const linkedInMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedInMatch) contact.linkedIn = `https://${linkedInMatch[0]}`;

  // GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) contact.github = `https://${githubMatch[0]}`;

  return contact;
};

/**
 * Determine file type from file name or mime type
 */
const getFileType = (fileName, mimeType) => {
  if (mimeType) {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('wordprocessingml') || mimeType.includes('docx')) return 'docx';
    if (mimeType.includes('msword')) return 'doc';
  }

  if (fileName) {
    const ext = path.extname(fileName).toLowerCase();
    if (ext === '.pdf') return 'pdf';
    if (ext === '.docx') return 'docx';
    if (ext === '.doc') return 'doc';
  }

  return null;
};

module.exports = {
  extractTextFromPDF,
  extractTextFromDOCX,
  extractText,
  extractTextFromURL,
  extractTextFromPath,
  cleanText,
  detectSections,
  extractBasicContactInfo,
  getFileType,
};
