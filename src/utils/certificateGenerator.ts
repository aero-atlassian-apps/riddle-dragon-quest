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

export const generateCertificate = async (data: CertificateData) => {
  // Define page dimensions and margins
  const pageWidth = 297; // A4 landscape width in mm
  const pageHeight = 210; // A4 landscape height in mm
  const margin = 15; // Page margin in mm

  // Create a new PDF document in landscape orientation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Add luxurious gold background
  try {
    doc.addImage('/images/gold-certificate-bg.jpg', 'JPEG', 0, 0, pageWidth, pageHeight);
  } catch (error) {
    console.warn('Error loading gold background:', error);
    
    // Fallback: Create a golden gradient background
    const ctx = doc.context2d;
    const gradient = ctx.createLinearGradient(0, 0, 0, pageHeight);
    gradient.addColorStop(0, '#deb761');
    gradient.addColorStop(0.5, '#f5d68e');
    gradient.addColorStop(1, '#deb761');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, pageWidth, pageHeight);
  }

  // Add elegant decorative border
  try {
    // Main ornate border
    doc.addImage('/images/certificate-border-ornate.png', 'PNG', margin, margin, 
                  pageWidth - 2 * margin, pageHeight - 2 * margin);
  } catch (error) {
    console.warn('Error loading border image:', error);
    
    // Fallback: Draw multiple layered borders
    // Outer border
    doc.setDrawColor(84, 58, 10);
    doc.setLineWidth(3);
    doc.roundedRect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 3, 3, 'S');
    
    // Inner gold border
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1.5);
    doc.roundedRect(margin + 3, margin + 3, pageWidth - 2 * (margin + 3), pageHeight - 2 * (margin + 3), 2, 2, 'S');
    
    // Decorative corner elements
    const cornerSize = 15;
    for (const pos of [[margin, margin], [pageWidth - margin - cornerSize, margin], 
                       [margin, pageHeight - margin - cornerSize], 
                       [pageWidth - margin - cornerSize, pageHeight - margin - cornerSize]]) {
      doc.setFillColor(212, 175, 55);
      doc.rect(pos[0], pos[1], cornerSize, cornerSize, 'F');
      doc.setFillColor(139, 69, 19);
      doc.rect(pos[0] + 2, pos[1] + 2, cornerSize - 4, cornerSize - 4, 'F');
    }
  }

  // Add certificate seal and ribbon
  try {
    // Gold seal with red ribbon
    doc.addImage('/images/gold-seal-ribbon.png', 'PNG', 
                 pageWidth/2 - 15, pageHeight - margin - 30, 30, 30);
  } catch (error) {
    console.warn('Error loading seal image:', error);
    
    // Fallback: Draw a simple seal
    const sealX = pageWidth/2;
    const sealY = pageHeight - margin - 15;
    const sealRadius = 10;
    
    // Gold seal circle
    doc.setFillColor(212, 175, 55);
    doc.circle(sealX, sealY, sealRadius, 'F');
    
    // Inner circle
    doc.setFillColor(184, 134, 11);
    doc.circle(sealX, sealY, sealRadius - 2, 'F');
    
    // Simple ribbon
    doc.setFillColor(178, 34, 34); // Red ribbon
    doc.triangle(sealX - 5, sealY + sealRadius, sealX, sealY + sealRadius + 10, 
                sealX + 5, sealY + sealRadius, 'F');
  }

  // Add heraldic shield emblem (centered near top)
  const shieldWidth = 40;
  const shieldHeight = 40;
  try {
    doc.addImage('/images/heraldic-shield-gold.png', 'PNG', 
                (pageWidth - shieldWidth) / 2, margin + 15, shieldWidth, shieldHeight);
  } catch (error) {
    console.warn('Error loading shield image:', error);
    
    // Fallback: Draw a simple shield shape
    const shieldX = pageWidth / 2;
    const shieldY = margin + 30;
    
    // Shield outline
    doc.setFillColor(212, 175, 55);
    doc.setDrawColor(139, 69, 19);
    doc.setLineWidth(1);
    
    // Draw shield (simple polygon approximation)
    const points = [
      [shieldX - 15, shieldY - 15], // Top left
      [shieldX + 15, shieldY - 15], // Top right
      [shieldX + 15, shieldY + 5],  // Middle right
      [shieldX, shieldY + 20],      // Bottom point
      [shieldX - 15, shieldY + 5]   // Middle left
    ];
    
    doc.triangle(points[0][0], points[0][1], points[1][0], points[1][1], points[4][0], points[4][1], 'F');
    doc.triangle(points[1][0], points[1][1], points[2][0], points[2][1], points[4][0], points[4][1], 'F');
    doc.triangle(points[2][0], points[2][1], points[3][0], points[3][1], points[4][0], points[4][1], 'F');
    
    // Shield border
    doc.lines([[points[1][0]-points[0][0], 0], [0, points[2][1]-points[1][1]], 
              [points[3][0]-points[2][0], points[3][1]-points[2][1]], 
              [points[4][0]-points[3][0], points[4][1]-points[3][1]], 
              [0, points[0][1]-points[4][1]]], 
              points[0][0], points[0][1], [1, 1, 1, 1, 1], 'S');
  }

  // Set up elegant typography
  // Title
  doc.setFont('Times', 'bold');
  doc.setFontSize(40);
  doc.setTextColor(84, 58, 10); // Dark gold/brown for contrast
  doc.text('CERTIFICAT', pageWidth / 2, margin + 70, { align: 'center' });
  doc.text('D\'ACCOMPLISSEMENT', pageWidth / 2, margin + 85, { align: 'center' });

  // Add decorative line separators
  function drawOrnateHorizontalDivider(y) {
    const lineWidth = 100;
    const lineX = (pageWidth - lineWidth) / 2;
    
    // Draw the main line
    doc.setDrawColor(84, 58, 10); // Dark gold
    doc.setLineWidth(1);
    doc.line(lineX, y, lineX + lineWidth, y);
    
    // Draw decorative middle element
    doc.setFillColor(84, 58, 10);
    doc.circle(pageWidth / 2, y, 2, 'F');
    
    // Draw small caps at line ends
    doc.circle(lineX, y, 1, 'F');
    doc.circle(lineX + lineWidth, y, 1, 'F');
  }
  
  drawOrnateHorizontalDivider(margin + 95);

  // Main certificate text
  doc.setFont('Times', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(84, 58, 10);
  
  const currentDate = format(data.date, 'dd MMMM yyyy', { locale: fr });
  
  // Introduction text
  let yPos = margin + 110;
  doc.text('Par la présente, nous attestons que', pageWidth / 2, yPos, { align: 'center' });
  
  // Recipient name (highlighted)
  yPos += 12;
  doc.setFont('Times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(139, 69, 19); // Darker gold for better contrast
  doc.text(data.warriorName || data.roomName, pageWidth / 2, yPos, { align: 'center' });
  
  // Rest of certificate text
  yPos += 12;
  doc.setFont('Times', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(84, 58, 10);
  
  const mainTextLines = [
    data.warriorName ? `de la troupe "${data.roomName}"` : '',
    `a participé avec bravoure au défi`,
    `"Game of Metrics"`,
    `lors de la Communauté de Pratique de ${format(data.date, 'MMMM yyyy', { locale: fr })}.`,
    ``,
    `Avec un score honorable de ${data.score} points,`,
    data.warriorName ? 
      `il/elle a fait preuve de perspicacité et d'ingéniosité` : 
      `ils ont fait preuve de perspicacité et d'ingéniosité`,
    `dans leur quête de connaissances.`,
  ];
  
  mainTextLines.forEach(line => {
    if (line) {
      // Highlight "Game of Metrics" in special styling
      if (line.includes('"Game of Metrics"')) {
        doc.setFont('Times', 'bolditalic');
        doc.setFontSize(18);
        doc.setTextColor(139, 69, 19);
      } else if (line.includes(`score honorable de ${data.score} points`)) {
        // Highlight the score
        const beforeScore = 'Avec un score honorable de ';
        const afterScore = ' points,';
        
        doc.text(beforeScore, pageWidth / 2, yPos, { align: 'center' });
        
        // Calculate position for the score
        const textWidth = doc.getTextWidth(beforeScore);
        const scoreX = (pageWidth / 2) - (doc.getTextWidth(beforeScore + String(data.score) + afterScore) / 2) + 
                       doc.getTextWidth(beforeScore);
        
        // Draw score in gold
        doc.setFont('Times', 'bold');
        doc.setTextColor(212, 175, 55);
        doc.text(String(data.score), scoreX, yPos);
        
        // Continue with the rest of the text
        doc.setFont('Times', 'normal');
        doc.setTextColor(84, 58, 10);
        doc.text(afterScore, scoreX + doc.getTextWidth(String(data.score)), yPos);
        
        yPos += 8;
        return;
      }
      
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
      
      // Reset styling after special lines
      if (line.includes('"Game of Metrics"')) {
        doc.setFont('Times', 'normal');
        doc.setFontSize(16);
        doc.setTextColor(84, 58, 10);
      }
      
      yPos += 8;
    } else {
      yPos += 4; // Empty line spacing
    }
  });

  // Add decorative signature lines
  // Date line
  const dateX = margin + 50;
  const signatureX = pageWidth - margin - 50;
  const signatureY = pageHeight - margin - 40;
  
  doc.setDrawColor(84, 58, 10);
  doc.setLineWidth(0.5);
  doc.line(dateX - 30, signatureY, dateX + 30, signatureY);
  doc.line(signatureX - 30, signatureY, signatureX + 30, signatureY);
  
  // Date and signature text
  doc.setFont('Times', 'italic');
  doc.setFontSize(12);
  doc.text(`Fait le ${currentDate}`, dateX, signatureY + 8, { align: 'center' });
  doc.text('Le Seigneur du Jeu', signatureX, signatureY + 8, { align: 'center' });

  // Add decorative flourishes at the bottom
  drawOrnateHorizontalDivider(pageHeight - margin - 20);

  return doc;
}