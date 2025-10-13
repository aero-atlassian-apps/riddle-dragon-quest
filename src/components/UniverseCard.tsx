import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Users, Trophy, Clock, Star, Plus, BookOpen, Trash2, CheckCircle } from "lucide-react";

interface Universe {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  troupe_count?: number;
  session_count?: number;
  theme?: {
    name: string;
    primary_color: string;
    background_image?: string;
  };
}

interface UniverseCardProps {
  universe: Universe;
  onView?: (universeId: string) => void;
  onDelete?: (universeId: string) => void;
  onAddSession?: (universeId: string) => void;
  onActivate?: (universeId: string) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

const UniverseCard: React.FC<UniverseCardProps> = ({
  universe,
  onView,
  onDelete,
  onAddSession,
  onActivate,
  showActions = true,
  variant = 'default'
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { 
        label: "Brouillon", 
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-400"
      },
      active: { 
        label: "Actif", 
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-400"
      },
      archived: { 
        label: "Archivé", 
        variant: "outline" as const,
        icon: Star,
        color: "text-gray-400"
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent size={12} />
        {config.label}
      </Badge>
    );
  };

  const getParticipantInfo = () => {
    const troupeCount = universe.troupe_count || 0;
    const sessionCount = universe.session_count || 0;
    
    return {
      troupeCount,
      sessionCount,
      canAddSessions: universe.status === 'draft'
    };
  };

  const participantInfo = getParticipantInfo();

  const cardStyle = universe.theme?.background_image 
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9)), url(${universe.theme.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {};

  const themeColor = universe.theme?.primary_color || '#10b981';

  if (variant === 'compact') {
    return (
      <Card className="bg-black/50 border-2 border-green-500 hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medieval text-green-400 text-lg">{universe.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(universe.status)}
                <div className="flex items-center gap-1 text-xs text-green-300">
                  <Users size={12} />
                  <span>{participantInfo.troupeCount} troupes</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-300">
                  <BookOpen size={12} />
                  <span>{participantInfo.sessionCount} sessions</span>
                </div>
              </div>
            </div>
            {showActions && (
              <div className="flex gap-1">

                {participantInfo.canAddSessions && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-400 hover:bg-green-500/20 font-pixel"
                    onClick={() => onAddSession?.(universe.id)}
                  >
                    <Plus size={12} className="mr-1" />
                    SESSION
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card 
        className="bg-black/50 border-2 border-green-500 hover:border-green-400 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 relative overflow-hidden"
        style={cardStyle}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
        <div className="relative z-10">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-medieval text-green-400 mb-2">
                  {universe.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(universe.status)}
                  <Badge variant="outline" className="text-green-300">
                    <Trophy size={12} className="mr-1" />
                    Univers Vedette
                  </Badge>
                </div>
              </div>
              <Globe className="text-green-400" size={32} />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-green-300 text-base mb-4 line-clamp-2">
              {universe.description}
            </CardDescription>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-green-400 font-pixel">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{participantInfo.troupeCount} troupes</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen size={16} />
                  <span>{participantInfo.sessionCount} sessions</span>
                </div>
              </div>
              
              {universe.theme && (
                <div className="flex items-center gap-1 text-xs text-green-300">
                  <div 
                    className="w-3 h-3 rounded-full border border-green-500"
                    style={{ backgroundColor: themeColor }}
                  />
                  <span>{universe.theme.name}</span>
                </div>
              )}
            </div>

            <div className="text-xs text-green-400 font-pixel mb-4">
            Créé le {new Date(universe.created_at).toLocaleDateString('fr-FR')}
          </div>

          {showActions && (
            <div className="flex gap-2">

              {universe.status === 'draft' && onActivate && (
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-pixel flex-1"
                  onClick={() => onActivate(universe.id)}
                >
                  <CheckCircle className="mr-2" size={16} />
                  ACTIVER
                </Button>
              )}
              {participantInfo.canAddSessions && (
                   <Button
                     className="bg-blue-500 hover:bg-blue-600 text-black font-pixel"
                     onClick={() => onAddSession?.(universe.id)}
                   >
                     <Plus className="mr-2" size={16} />
                     AJOUTER SESSION
                   </Button>
                 )}
                 {onDelete && (
                   <Button
                     variant="outline"
                     className="border-red-500 text-red-400 hover:bg-red-500/20 font-pixel"
                     onClick={() => onDelete(universe.id)}
                   >
                     <Trash2 size={16} />
                   </Button>
                 )}
            </div>
          )}
          </CardContent>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card 
      className="bg-black/50 border-2 border-green-500 hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 relative overflow-hidden"
      style={cardStyle}
    >
      <div className="absolute inset-0 bg-[url('/textures/stone-pattern.svg')] opacity-5" />
      <div className="absolute inset-0 bg-[url('/terminal-bg.png')] opacity-10" />
      <div className="relative z-10">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-green-400 font-medieval text-xl">
                {universe.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(universe.status)}
              </div>
            </div>
            <Globe className="text-green-400" size={24} />
          </div>
        </CardHeader>
        
        <CardContent>
          <CardDescription className="text-green-300 mb-4 line-clamp-3">
            {universe.description}
          </CardDescription>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm text-green-400 font-pixel">
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>{participantInfo.troupeCount} troupes</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen size={16} />
                <span>{participantInfo.sessionCount} sessions</span>
              </div>
            </div>
            
            {universe.theme && (
              <div className="flex items-center gap-1 text-xs text-green-300">
                <div 
                  className="w-3 h-3 rounded-full border border-green-500"
                  style={{ backgroundColor: themeColor }}
                />
                <span>{universe.theme.name}</span>
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex gap-2">

              {universe.status === 'draft' && onActivate && (
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-pixel flex-1"
                  onClick={() => onActivate(universe.id)}
                >
                  <CheckCircle className="mr-2" size={16} />
                  ACTIVER
                </Button>
              )}
              {participantInfo.canAddSessions && (
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-black font-pixel"
                  onClick={() => onAddSession?.(universe.id)}
                >
                  <Plus className="mr-2" size={16} />
                  AJOUTER SESSION
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500/20 font-pixel"
                  onClick={() => onDelete(universe.id)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default UniverseCard;