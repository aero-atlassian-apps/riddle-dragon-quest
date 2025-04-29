import React from 'react';
import { Scroll } from 'lucide-react';

interface CertificateIconProps {
  className?: string;
  onClick?: () => void;
}

const CertificateIcon: React.FC<CertificateIconProps> = ({ className = '', onClick }) => {
  return (
    <div 
      className={`relative group cursor-pointer ${className}`}
      onClick={onClick}
      title="Générer le certificat"
    >
      <Scroll 
        className="h-6 w-6 text-[#00FF00]/80 group-hover:text-[#00FF00] transition-colors"
      />
      <div className="absolute -inset-2 bg-[#00FF00]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default CertificateIcon;