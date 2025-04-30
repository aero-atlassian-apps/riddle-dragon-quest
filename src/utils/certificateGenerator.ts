import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CertificateData {
  roomName: string;
  sessionName: string;
  score: number;
  date: Date;
  warriorName?: string;
}

// Create an SVG gold pattern background programmatically
function createGoldPatternSVG(width: number, height: number): string {
  // Dimensions in pixels (SVG viewBox)
  const patternSize = 20;
  
  // Create gold gradient definitions
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <!-- Main gold gradient -->
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e6c988" />
        <stop offset="20%" stop-color="#f9e2a2" />
        <stop offset="50%" stop-color="#b88a44" />
        <stop offset="80%" stop-color="#f9e2a2" />
        <stop offset="100%" stop-color="#e6c988" />
      </linearGradient>
      
      <!-- Subtle pattern overlay -->
      <pattern id="noisePattern" width="${patternSize}" height="${patternSize}" patternUnits="userSpaceOnUse">
        <rect width="${patternSize}" height="${patternSize}" fill="url(#goldGradient)" />
        <path d="M0,0 L${patternSize},${patternSize}" stroke="#d4af37" stroke-width="0.5" stroke-opacity="0.3" />
        <path d="M${patternSize},0 L0,${patternSize}" stroke="#d4af37" stroke-width="0.5" stroke-opacity="0.3" />
      </pattern>
      
      <!-- Border pattern -->
      <pattern id="borderPattern" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#d4af37" />
        <rect x="0" y="0" width="4" height="4" fill="#b88a44" />
        <rect x="4" y="4" width="4" height="4" fill="#b88a44" />
      </pattern>

      <!-- Herringbone pattern for the background -->
      <pattern id="herringbonePattern" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0,0 L20,20 M40,0 L0,40 M20,20 L40,40" stroke="#d4af37" stroke-width="0.5" stroke-opacity="0.2" />
      </pattern>
    </defs>
    
    <!-- Main background -->
    <rect width="100%" height="100%" fill="url(#goldGradient)" />
    
    <!-- Pattern overlay -->
    <rect width="100%" height="100%" fill="url(#noisePattern)" opacity="0.4" />
    
    <!-- Herringbone pattern overlay -->
    <rect width="100%" height="100%" fill="url(#herringbonePattern)" opacity="0.3" />
    
    <!-- Outer frame -->
    <rect x="10" y="10" width="${width-20}" height="${height-20}" stroke="#634a22" stroke-width="2" fill="none" />
    
    <!-- Inner frame with elegant corners -->
    <rect x="20" y="20" width="${width-40}" height="${height-40}" stroke="#634a22" stroke-width="1" fill="none" />
    
    <!-- Decorative elements in corners -->
    <g fill="#634a22">
      <!-- Top left -->
      <circle cx="20" cy="20" r="5" />
      <circle cx="20" cy="20" r="3" fill="#d4af37" />
      
      <!-- Top right -->
      <circle cx="${width-20}" cy="20" r="5" />
      <circle cx="${width-20}" cy="20" r="3" fill="#d4af37" />
      
      <!-- Bottom left -->
      <circle cx="20" cy="${height-20}" r="5" />
      <circle cx="20" cy="${height-20}" r="3" fill="#d4af37" />
      
      <!-- Bottom right -->
      <circle cx="${width-20}" cy="${height-20}" r="5" />
      <circle cx="${width-20}" cy="${height-20}" r="3" fill="#d4af37" />
    </g>
    
    <!-- Decorative center border elements -->
    <g fill="#634a22">
      <circle cx="${width/2}" cy="20" r="3" />
      <circle cx="${width/2}" cy="${height-20}" r="3" />
      <circle cx="20" cy="${height/2}" r="3" />
      <circle cx="${width-20}" cy="${height/2}" r="3" />
    </g>
    
    <!-- Subtle herringbone pattern in the center area -->
    <rect x="30" y="30" width="${width-60}" height="${height-60}" fill="url(#noisePattern)" opacity="0.2" />
  </svg>`;
  
  return svg;
}

// Create an SVG for the gold medal with ribbon
function createGoldMedalSVG(width: number, height: number): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 60 80">
    <defs>
      <!-- Gold medal gradient -->
      <radialGradient id="medalGradient" cx="50%" cy="30%" r="70%" fx="50%" fy="30%">
        <stop offset="0%" stop-color="#fff6c8" />
        <stop offset="40%" stop-color="#ffd700" />
        <stop offset="100%" stop-color="#b88a44" />
      </radialGradient>
      
      <!-- Ribbon gradient -->
      <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c41e3a" />
        <stop offset="50%" stop-color="#ff033e" />
        <stop offset="100%" stop-color="#c41e3a" />
      </linearGradient>
    </defs>
    
    <!-- Ribbon -->
    <path d="M27,30 L15,70 L25,60 L30,75 L35,60 L45,70 L33,30" fill="url(#ribbonGradient)" />
    
    <!-- Medal circle -->
    <circle cx="30" cy="30" r="25" fill="url(#medalGradient)" stroke="#b88a44" stroke-width="1" />
    
    <!-- Medal inner details -->
    <circle cx="30" cy="30" r="20" fill="none" stroke="#b88a44" stroke-width="0.5" />
    <circle cx="30" cy="30" r="17" fill="none" stroke="#b88a44" stroke-width="0.7" />
    
    <!-- Medal shine effect -->
    <ellipse cx="25" cy="20" rx="10" ry="7" fill="#fff6c8" opacity="0.6" />
  </svg>`;
  
  return svg;
}

// Create an SVG for decorative divider lines
function createDividerSVG(width: number): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="10" viewBox="0 0 ${width} 10">
    <line x1="0" y1="5" x2="${width}" y2="5" stroke="#634a22" stroke-width="1" />
    <circle cx="${width/2}" cy="5" r="3" fill="#634a22" />
    <circle cx="${width/4}" cy="5" r="2" fill="#634a22" />
    <circle cx="${width*3/4}" cy="5" r="2" fill="#634a22" />
  </svg>`;
  
  return svg;
}

// Create an SVG for certificate seal
function createSealSVG(width: number): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 100 100">
    <defs>
      <!-- Gold seal gradient -->
      <radialGradient id="sealGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stop-color="#fff6c8" />
        <stop offset="60%" stop-color="#ffd700" />
        <stop offset="100%" stop-color="#b88a44" />
      </radialGradient>
      
      <!-- Red ribbon gradient -->
      <linearGradient id="sealRibbonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c41e3a" />
        <stop offset="50%" stop-color="#ff033e" />
        <stop offset="100%" stop-color="#c41e3a" />
      </linearGradient>
    </defs>
    
    <!-- Main seal -->
    <circle cx="50" cy="50" r="40" fill="url(#sealGradient)" stroke="#b88a44" stroke-width="1" />
    
    <!-- Inner rings -->
    <circle cx="50" cy="50" r="35" fill="none" stroke="#b88a44" stroke-width="0.5" />
    <circle cx="50" cy="50" r="32" fill="none" stroke="#b88a44" stroke-width="0.7" />
    
    <!-- Shine effect -->
    <ellipse cx="40" cy="40" rx="15" ry="10" fill="#fff6c8" opacity="0.6" />
    
    <!-- Ribbon tails -->
    <path d="M35,80 L20,100 M65,80 L80,100" stroke="url(#sealRibbonGradient)" stroke-width="5" stroke-linecap="round" />
    <path d="M45,80 L35,100 M55,80 L65,100" stroke="url(#sealRibbonGradient)" stroke-width="5" stroke-linecap="round" />
  </svg>`;
  
  return svg;
}

export const generateCertificate = async (data: CertificateData) => {
  // Define page dimensions and margins
  const pageWidth = 297; // A4 landscape width in mm
  const pageHeight = 210; // A4 landscape height in mm
  const margin = 20; // Page margin in mm

  // Create a new PDF document in landscape orientation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // STEP 1: Create and add the luxurious gold background
  try {
    // Try to add a pre-made background image first
    doc.addImage('/images/gold-background.jpg', 'JPEG', 0, 0, pageWidth, pageHeight);
  } catch (error) {
    console.warn('Pre-made background not found, creating programmatic background');
    
    // Create a gold patterned background using SVG
    const backgroundSVG = createGoldPatternSVG(pageWidth*3, pageHeight*3); // Higher resolution
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = pageWidth * 3;
    bgCanvas.height = pageHeight * 3;
    
    const bgCtx = bgCanvas.getContext('2d');
    if (bgCtx) {
      const img = new Image();
      img.onload = () => {
        bgCtx.drawImage(img, 0, 0);
        doc.addImage(bgCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, pageHeight);
        
        // Continue with rendering the rest of the certificate
        renderCertificateContent();
      };
      
      img.onerror = () => {
        console.warn('SVG background conversion failed, using fallback gradient');
        // Pure gold gradient fallback
        const ctx = doc.context2d;
        if (ctx) {
          const gradient = ctx.createLinearGradient(0, 0, pageWidth, pageHeight);
          gradient.addColorStop(0, '#e6c988');
          gradient.addColorStop(0.3, '#f9e2a2');
          gradient.addColorStop(0.5, '#b88a44');
          gradient.addColorStop(0.7, '#f9e2a2');
          gradient.addColorStop(1, '#e6c988');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, pageWidth, pageHeight);
        }
        
        renderCertificateContent();
      };
      
      // Convert SVG to data URL
      const blob = new Blob([backgroundSVG], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(blob);
      img.src = url;
    } else {
      // If canvas context isn't available, move on
      renderCertificateContent();
    }
  }

  // STEP 2: Draw the elegant border frame (multi-layered for luxury)
  function drawLuxuryBorders() {
    // Outer black border
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.rect(margin - 5, margin - 5, pageWidth - 2 * (margin - 5), pageHeight - 2 * (margin - 5), 'S');
    
    // Main gold border
    doc.setDrawColor(212, 175, 55); // Gold
    doc.setLineWidth(2);
    doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 'S');
    
    // Inner border (thinner)
    doc.setDrawColor(139, 69, 19); // Brown
    doc.setLineWidth(0.5);
    doc.rect(margin + 5, margin + 5, pageWidth - 2 * (margin + 5), pageHeight - 2 * (margin + 5), 'S');
    
    // Nested gold frame
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.rect(margin + 10, margin + 10, pageWidth - 2 * (margin + 10), pageHeight - 2 * (margin + 10), 'S');
    
    // Herringbone pattern fill between borders (subtle texture)
    try {
      // Create herringbone pattern
      const patternCanvas = document.createElement('canvas');
      const patternSize = 20;
      patternCanvas.width = patternSize;
      patternCanvas.height = patternSize;
      
      const pCtx = patternCanvas.getContext('2d');
      if (pCtx) {
        // Fill with gold color
        pCtx.fillStyle = '#f9e2a2';
        pCtx.fillRect(0, 0, patternSize, patternSize);
        
        // Draw herringbone lines
        pCtx.strokeStyle = '#e6c988';
        pCtx.lineWidth = 0.5;
        pCtx.beginPath();
        pCtx.moveTo(0, 0);
        pCtx.lineTo(patternSize, patternSize);
        pCtx.moveTo(0, patternSize);
        pCtx.lineTo(patternSize, 0);
        pCtx.stroke();
        
        // Apply pattern to border area
        const pattern = doc.context2d.createPattern(patternCanvas, 'repeat');
        if (pattern) {
          doc.context2d.fillStyle = pattern;
          // Fill the space between borders
          doc.context2d.fillRect(margin + 2, margin + 2, 
                              pageWidth - 2 * (margin + 2), pageHeight - 2 * (margin + 2));
        }
      }
    } catch (error) {
      console.warn('Pattern creation failed:', error);
    }
  }

  // STEP 3: Add the certificate content
  function renderCertificateContent() {
    // Draw luxury borders
    drawLuxuryBorders();
    
    // Add certificate seal at the bottom center
    try {
      const sealWidth = 30;
      const sealSVG = createSealSVG(sealWidth);
      
      const sealCanvas = document.createElement('canvas');
      sealCanvas.width = sealWidth * 3; // Higher resolution
      sealCanvas.height = sealWidth * 3;
      
      const sealCtx = sealCanvas.getContext('2d');
      if (sealCtx) {
        const sealImg = new Image();
        sealImg.onload = () => {
          sealCtx.drawImage(sealImg, 0, 0, sealCanvas.width, sealCanvas.height);
          
          // Position the seal at the bottom center
          doc.addImage(
            sealCanvas.toDataURL('image/png'), 'PNG', 
            pageWidth / 2 - sealWidth / 2, 
            pageHeight - margin - 30, 
            sealWidth, sealWidth
          );
        };
        
        // Convert seal SVG to data URL
        const sealBlob = new Blob([sealSVG], {type: 'image/svg+xml'});
        const sealUrl = URL.createObjectURL(sealBlob);
        sealImg.src = sealUrl;
      }
    } catch (error) {
      console.warn('Seal rendering failed:', error);
    }
    
    // CERTIFICATE TITLE - Elegant uppercase styling with subtle shadow
    doc.setFont('Times', 'bold');
    doc.setFontSize(48);
    doc.setTextColor(100, 84, 0); // Dark gold for better visibility
    
    // Title shadow effect (subtle offset)
    doc.text('CERTIFICATE', pageWidth / 2, margin + 40, { align: 'center' });
    
    // Main title (slightly offset for shadow effect)
    doc.setTextColor(212, 175, 55); // Bright gold
    doc.text('CERTIFICATE', pageWidth / 2 - 0.5, margin + 40 - 0.5, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(24);
    doc.setTextColor(100, 84, 0); // Dark gold
    doc.text('THIS CERTIFICATE IS PRESENTED TO', pageWidth / 2, margin + 65, { align: 'center' });
    
    // Add decorative divider below title
    try {
      const dividerWidth = 150;
      const dividerSVG = createDividerSVG(dividerWidth);
      
      const divCanvas = document.createElement('canvas');
      divCanvas.width = dividerWidth * 3; // Higher resolution
      divCanvas.height = 30;
      
      const divCtx = divCanvas.getContext('2d');
      if (divCtx) {
        const divImg = new Image();
        divImg.onload = () => {
          divCtx.drawImage(divImg, 0, 0, divCanvas.width, divCanvas.height);
          
          // Position the divider below title
          doc.addImage(
            divCanvas.toDataURL('image/png'), 'PNG', 
            (pageWidth - dividerWidth) / 2, 
            margin + 75, 
            dividerWidth, 10
          );
        };
        
        // Convert divider SVG to data URL
        const divBlob = new Blob([dividerSVG], {type: 'image/svg+xml'});
        const divUrl = URL.createObjectURL(divBlob);
        divImg.src = divUrl;
      }
    } catch (error) {
      console.warn('Divider rendering failed:', error);
      
      // Fallback divider
      doc.setDrawColor(139, 69, 19);
      doc.setLineWidth(1);
      doc.line(pageWidth/2 - 75, margin + 75, pageWidth/2 + 75, margin + 75);
      
      // Small decorative element in the middle
      doc.setFillColor(139, 69, 19);
      doc.circle(pageWidth/2, margin + 75, 2, 'F');
    }
    
    // MAIN TEXT CONTENT - Elegant styling with proper spacing
    // Recipient name (large and prominent)
    doc.setFont('Times', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(50, 30, 0); // Very dark gold/brown for main name
    
    const recipientName = data.warriorName || 'WARRIOR';
    doc.text(recipientName, pageWidth / 2, margin + 100, { align: 'center' });
    
    // Certificate details
    doc.setFont('Times', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(84, 58, 10); // Dark brown for readability on gold
    
    // Format the date in French
    const currentDate = format(data.date, 'dd MMMM yyyy', { locale: fr });
    
    // Achievement text
    const achievementText = `For successfully completing "${data.sessionName}" 
in the "${data.roomName}" escape room
with an impressive score of ${data.score}%.`;
    
    // Center the text block
    const splitAchievement = doc.splitTextToSize(achievementText, pageWidth - 100);
    doc.text(splitAchievement, pageWidth / 2, margin + 120, { align: 'center' });
    
    // Date text
    doc.text(`Issued on ${currentDate}`, pageWidth / 2, margin + 145, { align: 'center' });
    
    // Signature and date lines
    doc.setDrawColor(100, 84, 0); // Dark gold
    doc.setLineWidth(0.5);
    
    // Signature line on left side
    doc.line(pageWidth / 4 - 40, pageHeight - margin - 20, pageWidth / 4 + 40, pageHeight - margin - 20);
    doc.setFontSize(12);
    doc.text('SIGNATURE', pageWidth / 4, pageHeight - margin - 10, { align: 'center' });
    
    // Date line on right side
    doc.line(pageWidth * 3/4 - 40, pageHeight - margin - 20, pageWidth * 3/4 + 40, pageHeight - margin - 20);
    doc.text('DATE', pageWidth * 3/4, pageHeight - margin - 10, { align: 'center' });
    
    // Add a subtle watermark/background pattern in the center
    try {
      // Create a herringbone pattern fill
      const centerPatternCanvas = document.createElement('canvas');
      const centerPatternSize = 200;
      centerPatternCanvas.width = centerPatternSize;
      centerPatternCanvas.height = centerPatternSize;
      
      const cpCtx = centerPatternCanvas.getContext('2d');
      if (cpCtx) {
        // Fill with light gold
        cpCtx.fillStyle = '#f9e2a288'; // Semi-transparent
        cpCtx.fillRect(0, 0, centerPatternSize, centerPatternSize);
        
        // Draw herringbone pattern
        cpCtx.strokeStyle = '#d4af3722'; // Very light gold
        cpCtx.lineWidth = 1;
        
        // Create herringbone pattern
        const patternSpacing = 10;
        for (let i = -centerPatternSize; i < centerPatternSize * 2; i += patternSpacing) {
          cpCtx.beginPath();
          cpCtx.moveTo(i, 0);
          cpCtx.lineTo(i + centerPatternSize, centerPatternSize);
          cpCtx.stroke();
          
          cpCtx.beginPath();
          cpCtx.moveTo(i, centerPatternSize);
          cpCtx.lineTo(i + centerPatternSize, 0);
          cpCtx.stroke();
        }
        
        // Add pattern to center of certificate
        doc.addImage(
          centerPatternCanvas.toDataURL('image/png'), 'PNG',
          pageWidth / 2 - centerPatternSize / 4,
          pageHeight / 2 - centerPatternSize / 4,
          centerPatternSize / 2,
          centerPatternSize / 2
        );
      }
    } catch (error) {
      console.warn('Center pattern creation failed:', error);
    }
    
    // Return the document for saving or further processing
    return doc;
  }

  // Call renderCertificateContent directly if dynamic background fails
  return renderCertificateContent();
};