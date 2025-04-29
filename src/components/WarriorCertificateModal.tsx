import React, { useState } from 'react';
import { X, Plus, Download } from 'lucide-react';
import { generateCertificate } from '@/utils/certificateGenerator';
import { Score } from '@/types/game';
import { useToast } from './ui/use-toast';

interface WarriorCertificateModalProps {
  score: Score;
  isOpen: boolean;
  onClose: () => void;
}

interface Warrior {
  name: string;
  certificateGenerated?: boolean;
}

const WarriorCertificateModal: React.FC<WarriorCertificateModalProps> = ({ score, isOpen, onClose }) => {
  const [warriors, setWarriors] = useState<Warrior[]>([]);
  const [newWarriorName, setNewWarriorName] = useState('');
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleAddWarrior = () => {
    if (newWarriorName.trim()) {
      setWarriors([...warriors, { name: newWarriorName.trim() }]);
      setNewWarriorName('');
    }
  };

  const handleGenerateCertificate = async (warrior: Warrior) => {
    try {
      const doc = await generateCertificate({
        roomName: score.roomName,
        sessionName: 'Game of Metrics',
        score: score.totalScore,
        date: new Date(),
        warriorName: warrior.name
      });

      // Save the PDF
      doc.save(`certificat-${warrior.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);

      // Update warrior status
      setWarriors(warriors.map(w => 
        w.name === warrior.name ? { ...w, certificateGenerated: true } : w
      ));

      toast({
        title: 'Certificat généré',
        description: `Le certificat pour ${warrior.name} a été généré avec succès.`,
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du certificat.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1A1F2C] border border-[#00FF00]/30 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#00FF00]/70 hover:text-[#00FF00] transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-[#00FF00] mb-6">Générer des Certificats</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newWarriorName}
            onChange={(e) => setNewWarriorName(e.target.value)}
            placeholder="Nom du Guerrier"
            className="flex-1 bg-[#2A2F3C] border border-[#00FF00]/30 rounded px-3 py-2 text-[#00FF00] placeholder-[#00FF00]/50 focus:outline-none focus:border-[#00FF00]/60"
            onKeyPress={(e) => e.key === 'Enter' && handleAddWarrior()}
          />
          <button
            onClick={handleAddWarrior}
            className="bg-[#2A2F3C] border border-[#00FF00]/30 rounded p-2 text-[#00FF00]/70 hover:text-[#00FF00] hover:border-[#00FF00]/60 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {warriors.map((warrior, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-[#2A2F3C] border border-[#00FF00]/30 rounded p-3"
            >
              <span className="text-[#00FF00]">{warrior.name}</span>
              <button
                onClick={() => handleGenerateCertificate(warrior)}
                className="text-[#00FF00]/70 hover:text-[#00FF00] transition-colors"
                disabled={warrior.certificateGenerated}
              >
                <Download size={20} />
              </button>
            </div>
          ))}
        </div>

        {warriors.length === 0 && (
          <p className="text-center text-[#00FF00]/50 my-4">
            Ajoutez des guerriers pour générer leurs certificats_
          </p>
        )}
      </div>
    </div>
  );
};

export default WarriorCertificateModal;