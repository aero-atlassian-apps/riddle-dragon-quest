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
      
      <!-- Richer gold gradient for background -->
      <linearGradient id="richGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d4af37" />
        <stop offset="25%" stop-color="#f9e2a2" />
        <stop offset="50%" stop-color="#d4af37" />
        <stop offset="75%" stop-color="#f9e2a2" />
        <stop offset="100%" stop-color="#d4af37" />
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
    
    <!-- Main background - using richer gold gradient -->
    <rect width="100%" height="100%" fill="url(#richGoldGradient)" />
    
    <!-- Pattern overlay -->
    <rect width="100%" height="100%" fill="url(#noisePattern)" opacity="0.4" />
    
    <!-- Herringbone pattern overlay - full page -->
    <rect width="100%" height="100%" fill="url(#herringbonePattern)" opacity="0.3" />
    
    <!-- Outer frame - golden instead of brown -->
    <rect x="10" y="10" width="${width-20}" height="${height-20}" stroke="#d4af37" stroke-width="2" fill="none" />
    
    <!-- Inner frame with elegant corners -->
    <rect x="20" y="20" width="${width-40}" height="${height-40}" stroke="#b88a44" stroke-width="1" fill="none" />
    
    <!-- Decorative elements in corners -->
    <g fill="#b88a44">
      <!-- Top left -->
      <circle cx="20" cy="20" r="5" />
      <circle cx="20" cy="20" r="3" fill="#ffd700" />
      
      <!-- Top right -->
      <circle cx="${width-20}" cy="20" r="5" />
      <circle cx="${width-20}" cy="20" r="3" fill="#ffd700" />
      
      <!-- Bottom left -->
      <circle cx="20" cy="${height-20}" r="5" />
      <circle cx="20" cy="${height-20}" r="3" fill="#ffd700" />
      
      <!-- Bottom right -->
      <circle cx="${width-20}" cy="${height-20}" r="5" />
      <circle cx="${width-20}" cy="${height-20}" r="3" fill="#ffd700" />
    </g>
    
    <!-- Decorative center border elements -->
    <g fill="#b88a44">
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


// Create an SVG for certificate seal with Game of Metrics shield
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
      
      <!-- Fire gradient for shield -->
      <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#ffd700" />
        <stop offset="50%" stop-color="#f9e2a2" />
        <stop offset="100%" stop-color="#b88a44" />
      </linearGradient>
      
      <!-- Glow filter -->
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <!-- Main seal -->
    <circle cx="50" cy="50" r="40" fill="url(#sealGradient)" stroke="#b88a44" stroke-width="1" />
    
    <!-- Inner rings -->
    <circle cx="50" cy="50" r="35" fill="none" stroke="#b88a44" stroke-width="0.5" />
    <circle cx="50" cy="50" r="32" fill="none" stroke="#b88a44" stroke-width="0.7" />
    
    <!-- Shine effect -->
    <ellipse cx="40" cy="40" rx="15" ry="10" fill="#fff6c8" opacity="0.6" />
    
    <!-- Game of Metrics Shield (simplified and golden) -->
    <g transform="translate(50, 50) scale(0.4)" filter="url(#glow)">
      <!-- Shield -->
      <path 
        d="M0,-50 L50,-35 C50,0 50,35 0,50 C-50,35 -50,0 -50,-35 Z" 
        fill="#ffd700" 
        stroke="#b88a44" 
        stroke-width="2" 
      />
      
      <!-- Inner shield design -->
      <path 
        d="M0,-40 L40,-28 C40,0 40,28 0,40 C-40,28 -40,0 -40,-28 Z" 
        fill="#f9e2a2" 
        stroke="#b88a44" 
        stroke-width="1" 
      />
      
      <!-- Fire in the center (golden version) -->
      <path 
        d="M0,15 C5,8 8,0 6,-8 C10,0 14,-12 12,-16 C16,-4 20,-12 18,-20 C22,-12 24,-8 20,0 C28,-8 26,-4 24,4 C30,-2 28,8 22,12 C26,14 20,18 16,16 C18,20 12,22 8,18 C10,24 2,20 0,16 C-2,20 -10,24 -8,18 C-12,22 -18,20 -16,16 C-20,18 -26,14 -22,12 C-28,8 -30,-2 -24,4 C-26,-4 -28,-8 -20,0 C-24,-8 -22,-12 -18,-20 C-20,-12 -16,-4 -12,-16 C-14,-12 -10,0 -6,-8 C-8,0 -5,8 0,15 Z" 
        fill="url(#fireGradient)" 
      />
    </g>
    
    <!-- Ribbon tails -->
    <path d="M35,80 L20,100 M65,80 L80,100" stroke="url(#sealRibbonGradient)" stroke-width="5" stroke-linecap="round" />
    <path d="M45,80 L35,100 M55,80 L65,100" stroke="url(#sealRibbonGradient)" stroke-width="5" stroke-linecap="round" />
  </svg>`;
  
  return svg;
}

// Create Game of Metrics Shield SVG for certificate
function createGamesShieldSVG(width: number): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width/2}" viewBox="0 0 800 400">
    <defs>
      <filter id="shieldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      <!-- Gold fire gradient -->
      <linearGradient id="goldFireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#b88a44" />
        <stop offset="50%" stop-color="#ffd700" />
        <stop offset="100%" stop-color="#fff6c8" />
      </linearGradient>
      
      <!-- Gold text gradient -->
      <linearGradient id="goldTextGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff6c8" />
        <stop offset="50%" stop-color="#ffd700" />
        <stop offset="100%" stop-color="#b88a44" />
      </linearGradient>
    </defs>
    
    <!-- Shield with fire -->
    <g transform="translate(400, 250)" filter="url(#shieldGlow)">
      <!-- Shield -->
      <path 
        d="M0,-120 L120,-80 C120,0 120,80 0,120 C-120,80 -120,0 -120,-80 Z" 
        fill="#ffd700" 
        stroke="#b88a44" 
        stroke-width="4" 
      />
      
      <!-- Inner shield design -->
      <path 
        d="M0,-100 L100,-65 C100,0 100,65 0,100 C-100,65 -100,0 -100,-65 Z" 
        fill="#f9e2a2" 
        stroke="#b88a44" 
        stroke-width="2" 
      />
      
      <!-- Fire in the center (golden version) -->
      <path 
        d="M0,40 C10,20 20,0 15,-20 C25,0 35,-30 30,-40 C40,-10 50,-30 45,-50 C55,-30 60,-20 50,0 C70,-20 65,-10 60,10 C75,-5 70,20 55,30 C65,35 50,45 40,40 C45,50 30,55 20,45 C25,60 5,50 0,40 C-5,50 -25,60 -20,45 C-30,55 -45,50 -40,40 C-50,45 -65,35 -55,30 C-70,20 -75,-5 -60,10 C-65,-10 -70,-20 -50,0 C-60,-20 -55,-30 -45,-50 C-50,-30 -40,-10 -30,-40 C-35,-30 -25,0 -15,-20 C-20,0 -10,20 0,40 Z" 
        fill="url(#goldFireGradient)" 
      />
    </g>
    
    <!-- Game of Metrics Text - Positioned above the shield -->
    <g filter="url(#shieldGlow)">
      <text 
        x="400" 
        y="80" 
        text-anchor="middle" 
        fill="url(#goldTextGradient)"
        stroke="#b88a44"
        stroke-width="1"
        font-size="50"
        font-family="'Cinzel', serif"
      >
        GAME OF
      </text>
      <text 
        x="400" 
        y="140" 
        text-anchor="middle" 
        fill="url(#goldTextGradient)"
        stroke="#b88a44"
        stroke-width="1"
        font-size="70"
        font-family="'Cinzel', serif"
      >
        METRICS
      </text>
    </g>
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
    // Outer golden border instead of black
    doc.setDrawColor(184, 138, 68); // Dark gold
    doc.setLineWidth(1.5);
    doc.rect(margin - 5, margin - 5, pageWidth - 2 * (margin - 5), pageHeight - 2 * (margin - 5), 'S');
    
    // Main gold border
    doc.setDrawColor(212, 175, 55); // Gold
    doc.setLineWidth(2);
    doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 'S');
    
    // Inner border (thinner)
    doc.setDrawColor(184, 138, 68); // Dark gold instead of brown
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
with an impressive score of ${data.score}`;
    
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
    
    // Add 'Community Of Practices' signature
    doc.setFont('Brush Script MT', 'italic');
    doc.setFontSize(18);
    doc.setTextColor(139, 69, 19); // Brown for signature
    doc.text('Community Of Practices', pageWidth / 4, pageHeight - margin - 30, { align: 'center' });
    doc.setFont('Times', 'normal');
    
    // Date line on right side
    doc.line(pageWidth * 3/4 - 40, pageHeight - margin - 20, pageWidth * 3/4 + 40, pageHeight - margin - 20);
    doc.text('DATE', pageWidth * 3/4, pageHeight - margin - 10, { align: 'center' });
    
    // Add the date under the date line
    doc.setFontSize(14);
    doc.setTextColor(100, 84, 0); // Dark gold
    doc.text(format(data.date, 'dd MMMM yyyy', { locale: fr }), pageWidth * 3/4, pageHeight - margin - 30, { align: 'center' });
    
    // Add Game of Metrics Shield as a watermark in the center
    try {
      // Create the Game of Metrics Shield as a watermark
      const shieldWidth = 120;
      const shieldSVG = createGamesShieldSVG(shieldWidth);
      
      const shieldCanvas = document.createElement('canvas');
      shieldCanvas.width = shieldWidth * 3; // Higher resolution
      shieldCanvas.height = shieldWidth * 1.5 * 3;
      
      const shieldCtx = shieldCanvas.getContext('2d');
      if (shieldCtx) {
        const shieldImg = new Image();
        shieldImg.onload = () => {
          shieldCtx.drawImage(shieldImg, 0, 0, shieldCanvas.width, shieldCanvas.height);
          
          // Position the shield in the center of the certificate as a watermark
          doc.addImage(
            shieldCanvas.toDataURL('image/png'), 'PNG', 
            pageWidth / 2 - shieldWidth / 2, 
            pageHeight / 2 - shieldWidth / 3, 
            shieldWidth, 
            shieldWidth / 2
          );
        };
        
        // Convert shield SVG to data URL
        const shieldBlob = new Blob([shieldSVG], {type: 'image/svg+xml'});
        const shieldUrl = URL.createObjectURL(shieldBlob);
        shieldImg.src = shieldUrl;
      }
      
      // Create a herringbone pattern fill for the entire background
      const centerPatternCanvas = document.createElement('canvas');
      const centerPatternSize = pageWidth;
      centerPatternCanvas.width = centerPatternSize;
      centerPatternCanvas.height = centerPatternSize;
      
      const cpCtx = centerPatternCanvas.getContext('2d');
      if (cpCtx) {
        // Fill with light gold
        cpCtx.fillStyle = '#f9e2a222'; // Very semi-transparent
        cpCtx.fillRect(0, 0, centerPatternSize, centerPatternSize);
        
        // Draw herringbone pattern
        cpCtx.strokeStyle = '#d4af3722'; // Very light gold
        cpCtx.lineWidth = 1;
        
        // Create herringbone pattern
        const patternSpacing = 20;
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
        
        // Add pattern to entire certificate (behind the shield)
        doc.addImage(
          centerPatternCanvas.toDataURL('image/png'), 'PNG',
          margin + 15,
          margin + 15,
          pageWidth - 2 * (margin + 15),
          pageHeight - 2 * (margin + 15)
        );
      }
    } catch (error) {
      console.warn('Center pattern or shield creation failed:', error);
    }
    
    // Return the document for saving or further processing
    return doc;
  }

  // Call renderCertificateContent directly if dynamic background fails
  return renderCertificateContent();
};