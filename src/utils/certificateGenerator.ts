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

  // Add parchment background (high-res, elegant)
  doc.addImage('/images/parchment-bg-highres.jpg', 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());

  // Use a medieval and script font for elegance
  doc.setFont('Cinzel', 'bold');

  // Ornate gold border
  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(2.5);
  doc.roundedRect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 8, 8, 'S');
  // Decorative inner border
  doc.setDrawColor(44, 62, 80); // Royal blue
  doc.setLineWidth(1);
  doc.roundedRect(margin+4, margin+4, pageWidth - 2 * (margin+4), pageHeight - 2 * (margin+4), 6, 6, 'S');

  // Add graphical flourishes (ribbons/seal)
  doc.setFillColor(212, 175, 55);
  doc.circle(pageWidth/2, margin+18, 8, 'F'); // Gold seal top center
  doc.setFillColor(44, 62, 80);
  doc.circle(pageWidth/2, pageHeight-margin-18, 8, 'F'); // Blue seal bottom center

  // Add high-res SVG emblem (centered, larger)
  const shieldWidth = 70;
  const shieldHeight = 70;
  const canvas = document.createElement('canvas');
  canvas.width = shieldWidth;
  canvas.height = shieldHeight;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.width = shieldWidth;
  img.height = shieldHeight;
  await new Promise((resolve, reject) => {
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, shieldWidth, shieldHeight);
      try {
        const pngData = canvas.toDataURL('image/png');
        doc.addImage(pngData, 'PNG', (pageWidth - shieldWidth) / 2, margin + 22, shieldWidth, shieldHeight);
        resolve(null);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = '/images/shield-highres.svg';
  });

  // Add certificate title (large, gold, medieval font)
  doc.setFont('Cinzel', 'bold');
  doc.setFontSize(38);
  doc.setTextColor(212, 175, 55); // Gold
  doc.text('CERTIFICAT D\'ACCOMPLISSEMENT', pageWidth / 2, margin + 110, { align: 'center' });

  // Add main text (script font for name, medieval for rest)
  doc.setFont('Cinzel', 'normal');
  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80); // Royal blue
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
  let yPosition = margin + 135;
  mainText.forEach((line, index) => {
    if (index === 1) {
      doc.setFont('GreatVibes', 'normal'); // Script font for name
      doc.setFontSize(26);
      doc.setTextColor(212, 175, 55); // Gold
    } else if (index === 2) {
      doc.setFont('Cinzel', 'normal');
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80);
    } else {
      doc.setFont('Cinzel', 'normal');
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
    }
    doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;
  });

  // Add signature section (script font, gold)
  doc.setFont('GreatVibes', 'normal');
  doc.setFontSize(18);
  doc.setTextColor(212, 175, 55);
  doc.text('Le Seigneur du Jeu', pageWidth - margin - 60, pageHeight - margin - 30, { align: 'center' });
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.line(pageWidth - margin - 90, pageHeight - margin - 35, pageWidth - margin - 30, pageHeight - margin - 35);

  // Add date (medieval font, blue)
  doc.setFont('Cinzel', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text(
    `Fait le ${format(data.date, 'dd MMMM yyyy', { locale: fr })}`,
    margin + 60,
    pageHeight - margin - 30,
    { align: 'center' }
  );

  return doc;
};