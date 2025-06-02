const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { DOMParser } = require('xmldom');

// Define language folders to process
const languageFolders = [
  { name: 'Chewa', folder: 'Cewa Hymns', output: 'chewa-hymns.js', varName: 'chewaHymns' },
  { name: 'English', folder: 'English Hymns', output: 'english-hymns.js', varName: 'englishHymns' },
  { name: 'Tonga', folder: 'Tonga Hymns', output: 'tonga-hymns.js', varName: 'tongaHymns' },
  { name: 'Tumbuka', folder: 'tumbuka', output: 'tumbuka-hymns.js', varName: 'tumbukaHymns' },
  { name: 'Zulu', folder: 'Zulu', output: 'zulu-hymns.js', varName: 'zuluHymns' },
];

// Ensure the db directory exists
const dbDir = path.join(__dirname, 'scr', 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Function to extract hymn number and title from filename
function extractHymnInfo(filename) {
  // Remove file extension
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  
  // Extract hymn number and title
  const match = nameWithoutExt.match(/^(\d+)\s+(.+)$/);
  
  if (match) {
    return {
      hymnNo: parseInt(match[1], 10),
      title: match[2].trim()
    };
  }
  
  // For files that only have a number
  const numberMatch = nameWithoutExt.match(/^(\d+)$/);
  if (numberMatch) {
    return {
      hymnNo: parseInt(numberMatch[1], 10),
      title: `Hymn ${numberMatch[1]}` // Placeholder title
    };
  }
  
  // For files that might have non-numeric prefixes
  const complexMatch = nameWithoutExt.match(/\d+/);
  if (complexMatch) {
    const number = parseInt(complexMatch[0], 10);
    const title = nameWithoutExt.replace(complexMatch[0], '').trim();
    return {
      hymnNo: number,
      title: title || `Hymn ${number}`
    };
  }
  
  return null;
}

// Function to extract text from PowerPoint file (both .ppt and .pptx)
async function extractTextFromPPTX(filePath) {
  try {
    const fileExt = path.extname(filePath).toLowerCase();
    
    // For .ppt files, use office-text-extractor with dynamic import
    if (fileExt === '.ppt') {
      // Dynamically import the ES module
      const officeExtractorModule = await import('office-text-extractor');
      // Access the getTextExtractor function from the module
      const { getTextExtractor } = officeExtractorModule;
      // Create an extractor instance
      const extractor = getTextExtractor();
      // Extract the text - FIXED: using the correct method
      const text = await extractor.extractText({ input: filePath, type: 'file' });
      
      // Split the text by multiple newlines to separate slides
      // Using a more robust pattern to split slides
      const slideTexts = text.split(/\n{3,}/);
      
      const slides = slideTexts
        .filter(slideText => slideText.trim() !== '')
        .map((slideText, index) => {
          // Split each slide text by newlines to get paragraphs
          const paragraphs = slideText.split(/\n/).filter(line => line.trim() !== '');
          return {
            index: index + 1,
            text: paragraphs
          };
        });
      
      return { slides };
    }
    
    // For .pptx files, use the existing AdmZip method
    const zip = new AdmZip(filePath);
    const slides = [];
    const parser = new DOMParser();
    const drawingmlNamespace = "http://schemas.openxmlformats.org/drawingml/2006/main";
    
    // Find all slide files in the PPTX
    let slideIndex = 1;
    while (true) {
      const slideEntry = zip.getEntry(`ppt/slides/slide${slideIndex}.xml`);
      if (!slideEntry) break;
      
      const slideContent = slideEntry.getData().toString('utf8');
      const xmlDoc = parser.parseFromString(slideContent, 'text/xml');
      
      // Extract text from paragraphs (p elements)
      const paragraphs = [];
      const paragraphElements = xmlDoc.getElementsByTagNameNS("http://schemas.openxmlformats.org/drawingml/2006/main", 'p');
      
      for (let i = 0; i < paragraphElements.length; i++) {
        const paragraph = paragraphElements[i];
        const textElements = paragraph.getElementsByTagNameNS(drawingmlNamespace, 't');
        
        // Combine all text elements within a paragraph to form a complete line
        let fullLine = '';
        for (let j = 0; j < textElements.length; j++) {
          fullLine += textElements[j].textContent;
        }
        
        if (fullLine.trim()) {
          paragraphs.push(fullLine.trim());
        }
      }
      
      slides.push({
        index: slideIndex,
        text: paragraphs
      });
      
      slideIndex++;
    }
    
    return { slides };
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    return { slides: [] };
  }
}

// Function to process a PowerPoint file and extract hymn content
async function processHymnFile(filePath) {
  try {
    const fileInfo = extractHymnInfo(path.basename(filePath));
    if (!fileInfo) return null;
    
    console.log(`Processing hymn #${fileInfo.hymnNo}: ${fileInfo.title}`);
    
    // Extract text from PowerPoint
    const extractedText = await extractTextFromPPTX(filePath);
    
    // Process the extracted text to identify chorus and stanzas
    const hymn = {
      ...fileInfo,
      creator: 'Unknown', // You may need to manually update this later
      chorus: null,
      stanzers: []
    };
    
    // Process each slide as a separate stanza
    for (const slide of extractedText.slides) {
      const slideText = slide.text.join('\n');
      
      // Skip empty slides
      if (!slide.text.some(line => line.trim() !== '')) {
        continue;
      }
      
      // Check if this slide contains a chorus
      if (slideText.toLowerCase().includes('chorus') || 
          slideText.toLowerCase().includes('refrain') ||
          slideText.toLowerCase().includes('na chorus')) {
        
        // Extract chorus lines (skip the first line if it's just "Chorus:")
        const lines = slide.text.filter(line => 
          !line.toLowerCase().match(/^\s*(chorus|refrain|na chorus)\s*:?\s*$/) && 
          line.trim() !== '');
          
        hymn.chorus = lines;
      } else {
        // This is a regular stanza
        const stanzaNumber = hymn.stanzers.length + 1;
        
        // Filter out empty lines
        const lines = slide.text.filter(line => line.trim() !== '');
        
        if (lines.length > 0) {
          hymn.stanzers.push({
            stanzer: stanzaNumber,
            lines: lines
          });
        }
      }
    }
    
    return hymn;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

// Main function to process all hymn files for a specific language
async function processLanguageHymns(languageConfig) {
  try {
    const hymnsFolder = path.join(__dirname, 'scr', languageConfig.folder);
    const outputFile = path.join(__dirname, 'scr', 'db', languageConfig.output);
    
    console.log(`\nProcessing ${languageConfig.name} hymns from ${hymnsFolder}...`);
    
    // Check if the folder exists
    if (!fs.existsSync(hymnsFolder)) {
      console.error(`Folder not found: ${hymnsFolder}`);
      return;
    }
    
    // Get all PowerPoint files in the folder
    const files = fs.readdirSync(hymnsFolder)
      .filter(file => 
        (file.endsWith('.pptx') || file.endsWith('.ppt')) && 
        !file.startsWith('~$')); // Exclude temporary files
    
    // Sort files by hymn number
    files.sort((a, b) => {
      const infoA = extractHymnInfo(a);
      const infoB = extractHymnInfo(b);
      
      if (!infoA) return 1;
      if (!infoB) return -1;
      
      return infoA.hymnNo - infoB.hymnNo;
    });
    
    // Process each file
    const hymns = [];
    for (const file of files) {
      const filePath = path.join(hymnsFolder, file);
      const hymn = await processHymnFile(filePath);
      if (hymn) hymns.push(hymn);
    }
    
    // Generate the output JavaScript
    const outputJS = `// Auto-generated ${languageConfig.name} hymns data
export const ${languageConfig.varName} = ${JSON.stringify(hymns, null, 2)};
`;
    
    // Write to file
    fs.writeFileSync(outputFile, outputJS);
    
    console.log(`Successfully processed ${hymns.length} ${languageConfig.name} hymns and saved to ${outputFile}`);
  } catch (error) {
    console.error(`Error processing ${languageConfig.name} hymns:`, error);
  }
}

// Main function to process all languages
async function processAllHymns() {
  try {
    for (const languageConfig of languageFolders) {
      await processLanguageHymns(languageConfig);
    }
    
    console.log('\nAll hymn processing completed!');
  } catch (error) {
    console.error('Error processing hymns:', error);
  }
}

// Run the script
processAllHymns();