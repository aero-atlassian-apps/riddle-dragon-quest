import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Score } from '@/types/game';

interface CertificateData {
  roomName: string;
  sessionName: string;
  score: number;
  date: Date;
  warriorName?: string;
}

export const generateCertificate = async (data: CertificateData) => {
  // Create a new PDF document in landscape orientation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Add parchment background
  doc.addImage('/images/parchment-bg.jpg', 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());

  // Set the font to a more medieval-looking style
  doc.setFont('Times', 'Roman');

  // Add decorative border (placeholder - you can enhance this)
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // Draw border
  doc.setDrawColor(139, 69, 19); // Sepia tone
  doc.setLineWidth(1);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

  // Convert SVG to PNG using canvas and add to PDF
  const shieldWidth = 60;
  const shieldHeight = 60;
  
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = shieldWidth;
  canvas.height = shieldHeight;
  const ctx = canvas.getContext('2d');
  
  // Create a new image element
  const img = new Image();
  img.width = shieldWidth;
  img.height = shieldHeight;
  
  // Convert SVG to PNG
  await new Promise((resolve, reject) => {
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, shieldWidth, shieldHeight);
      try {
        // Convert canvas to PNG and add to PDF
        const pngData = canvas.toDataURL('image/png');
        doc.addImage(pngData, 'PNG', (pageWidth - shieldWidth) / 2, margin + 10, shieldWidth, shieldHeight);
        resolve(null);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = '/images/shield.svg';
  });

  // Add certificate title
  doc.setFontSize(30);
  doc.setTextColor(139, 69, 19); // Sepia tone
  doc.text('CERTIFICAT D\'ACCOMPLISSEMENT', pageWidth / 2, margin + 90, { align: 'center' });

  // Add main text
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  
  const currentDate = format(data.date, 'MMMM yyyy', { locale: fr });
  
  const mainText = [
    `Par la présente, nous attestons que`,
    data.warriorName ? `${data.warriorName}` : `la troupe "${data.roomName}"`,
    `de la troupe "${data.roomName}"`,
    `a participé avec bravoure au défi`,
    `"Game of Metrics"`,
    `lors de la Communauté de Pratique de ${currentDate}.`,
    ``,
    `Avec un score honorable de ${data.score} points,`,
    data.warriorName ? 
      `il/elle a fait preuve de perspicacité et d'ingéniosité` :
      `ils ont fait preuve de perspicacité et d'ingéniosité`,
    `dans leur quête de connaissances.`,
    ``,
    `Leur sagesse dans l'utilisation des indices a été remarquable,`,
    `démontrant une stratégie digne des plus grands tacticiens.`
  ];

  let yPosition = margin + 120;
  mainText.forEach((line, index) => {
    if (index === 1) doc.setFontSize(20); // Emphasize team name
    if (index === 2) doc.setFontSize(16);
    doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  });

  // Add signature section
  doc.setFontSize(14);
  doc.text('Le Seigneur du Jeu', pageWidth - margin - 50, pageHeight - margin - 30, { align: 'center' });
  doc.line(pageWidth - margin - 80, pageHeight - margin - 35, pageWidth - margin - 20, pageHeight - margin - 35);

  // Add date
  doc.setFontSize(12);
  doc.text(
    `Fait le ${format(data.date, 'dd MMMM yyyy', { locale: fr })}`,
    margin + 50,
    pageHeight - margin - 30,
    { align: 'center' }
  );

  return doc;
};