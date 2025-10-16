import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Crown, Trophy, Clock, Star, Plus, Swords, Trash2, CheckCircle } from "lucide-react";
import { Universe } from "@/types/game";

// Use shared Universe type from types/game (includes challenge_count)

interface UniverseCardProps {
  universe: Universe;
  onView?: (universeId: string) => void;
  onDelete?: (universeId: string) => void;
  onAddChallenge?: (universeId: string) => void;
  onActivate?: (universeId: string) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

const UniverseCard: React.FC<UniverseCardProps> = ({
  universe,
  onView,
  onDelete,
  onAddChallenge,
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
    const challengeCount = universe.challenge_count || 0;
    
    return {
      troupeCount,
      challengeCount,
      canAddChallenges: universe.status === 'draft'
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
        <CardContent className="p-3 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medieval text-green-400 text-lg">{universe.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(universe.status)}
              </div>
              <CardDescription className="text-green-300 text-sm mt-2 line-clamp-2">
                {universe.description}
              </CardDescription>
              <div className="flex items-center gap-4 mt-2 text-sm text-green-400 font-pixel">
                <div className="flex items-center gap-1">
                  <Crown size={16} />
                  <span>{participantInfo.troupeCount} troupes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Swords size={16} />
                  <span>{participantInfo.challengeCount} challenges</span>
                </div>
              </div>
            </div>
            <TooltipProvider>
              <div className="absolute right-2 top-2 flex flex-col items-center gap-1">
                {showActions && universe.status === 'draft' && onActivate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20 h-8 w-8 p-0"
                        onClick={() => onActivate(universe.id)}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Activer</TooltipContent>
                  </Tooltip>
                )}
                {showActions && universe.status === 'draft' && participantInfo.canAddChallenges && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/20 h-8 w-8 p-0"
                        onClick={() => onAddChallenge?.(universe.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ajouter challenge</TooltipContent>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/20 h-8 w-8 p-0"
                        onClick={() => onDelete(universe.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Supprimer</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
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
            <div className="flex justify-between items-start relative">
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
              <TooltipProvider>
                <div className="absolute right-2 top-2 flex flex-col items-center gap-1">
                  {/* Consult (view) icon removed per request */}
                  {onDelete && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/20 h-8 w-8 p-0"
                          onClick={() => onDelete(universe.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Supprimer</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-green-300 text-base mb-4 line-clamp-2">
              {universe.description}
            </CardDescription>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-green-400 font-pixel">
                <div className="flex items-center gap-1">
              <Crown size={16} />
                  <span>{participantInfo.troupeCount} troupes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Swords size={16} />
                  <span>{participantInfo.challengeCount} challenges</span>
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

          {/* Actions moved to header cluster; footer actions removed for compactness */}
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
        <CardHeader className="py-3">
          <div className="flex justify-between items-start relative">
            <div>
              <CardTitle className="text-green-400 font-medieval text-lg">
                {universe.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(universe.status)}
              </div>
            </div>
            <TooltipProvider>
              <div className="absolute right-2 top-2 flex flex-col items-center gap-1">
                {showActions && universe.status === 'draft' && onActivate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20 h-8 w-8 p-0"
                        onClick={() => onActivate(universe.id)}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Activer</TooltipContent>
                  </Tooltip>
                )}
                {showActions && universe.status === 'draft' && participantInfo.canAddChallenges && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/20 h-8 w-8 p-0"
                        onClick={() => onAddChallenge?.(universe.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ajouter challenge</TooltipContent>
                  </Tooltip>
                )}
                {/* Consult (view) icon removed per request */}
                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/20 h-8 w-8 p-0"
                        onClick={() => onDelete(universe.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Supprimer</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        <CardContent>
          <CardDescription className="text-green-300 text-sm mb-3 line-clamp-2">
            {universe.description}
          </CardDescription>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4 text-sm text-green-400 font-pixel">
              <div className="flex items-center gap-1">
                <Crown size={16} />
                <span>{participantInfo.troupeCount} troupes</span>
              </div>
              <div className="flex items-center gap-1">
                <Swords size={16} />
                <span>{participantInfo.challengeCount} challenges</span>
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

          {/* Actions moved to header cluster; footer actions removed for compactness */}
          </CardContent>
        </div>
      </Card>
    );
};

export default UniverseCard;