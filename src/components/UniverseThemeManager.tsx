import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Palette, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { getUniverseThemes, createUniverseTheme, updateUniverseTheme, deleteUniverseTheme, UniverseTheme } from '@/utils/db';

interface UniverseThemeManagerProps {
  universeId: string;
  onThemeChange?: (theme: UniverseTheme) => void;
}

const UniverseThemeManager: React.FC<UniverseThemeManagerProps> = ({ universeId, onThemeChange }) => {
  const [themes, setThemes] = useState<UniverseTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<UniverseTheme | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    accent_color: '#F59E0B',
    background_color: '#1F2937',
    text_color: '#F9FAFB',
    is_active: false
  });

  useEffect(() => {
    loadThemes();
  }, [universeId]);

  const loadThemes = async () => {
    setIsLoading(true);
    try {
      const data = await getUniverseThemes(universeId);
      setThemes(data);
    } catch (error) {
      console.error('Error loading themes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les thèmes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTheme) {
        const updated = await updateUniverseTheme(editingTheme.id, formData);
        if (updated) {
          setThemes(themes.map(t => t.id === editingTheme.id ? updated : t));
          toast({
            title: "Succès",
            description: "Thème mis à jour avec succès",
          });
        }
      } else {
        const created = await createUniverseTheme({
          ...formData,
          universe_id: universeId
        });
        if (created) {
          setThemes([created, ...themes]);
          toast({
            title: "Succès",
            description: "Thème créé avec succès",
          });
        }
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le thème",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (theme: UniverseTheme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      description: theme.description,
      primary_color: theme.primary_color,
      secondary_color: theme.secondary_color,
      accent_color: theme.accent_color,
      background_color: theme.background_color,
      text_color: theme.text_color,
      is_active: theme.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (themeId: string) => {
    try {
      const success = await deleteUniverseTheme(themeId);
      if (success) {
        setThemes(themes.filter(t => t.id !== themeId));
        toast({
          title: "Succès",
          description: "Thème supprimé avec succès",
        });
      }
    } catch (error) {
      console.error('Error deleting theme:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le thème",
        variant: "destructive",
      });
    }
  };

  const handleActivateTheme = async (themeId: string) => {
    try {
      // Deactivate all themes first
      const deactivatePromises = themes.map(theme => 
        updateUniverseTheme(theme.id, { is_active: false })
      );
      await Promise.all(deactivatePromises);

      // Activate the selected theme
      const updated = await updateUniverseTheme(themeId, { is_active: true });
      if (updated) {
        const updatedThemes = themes.map(t => ({
          ...t,
          is_active: t.id === themeId
        }));
        setThemes(updatedThemes);
        
        if (onThemeChange) {
          onThemeChange(updated);
        }
        
        toast({
          title: "Succès",
          description: "Thème activé avec succès",
        });
      }
    } catch (error) {
      console.error('Error activating theme:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer le thème",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      primary_color: '#3B82F6',
      secondary_color: '#1E40AF',
      accent_color: '#F59E0B',
      background_color: '#1F2937',
      text_color: '#F9FAFB',
      is_active: false
    });
    setEditingTheme(null);
  };

  const ThemePreview = ({ theme }: { theme: typeof formData }) => (
    <div 
      className="w-full h-32 rounded-lg border-2 p-4 flex flex-col justify-between"
      style={{ 
        backgroundColor: theme.background_color,
        borderColor: theme.primary_color,
        color: theme.text_color
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div 
            className="text-sm font-semibold"
            style={{ color: theme.primary_color }}
          >
            Titre Principal
          </div>
          <div 
            className="text-xs"
            style={{ color: theme.secondary_color }}
          >
            Sous-titre
          </div>
        </div>
        <div 
          className="w-4 h-4 rounded"
          style={{ backgroundColor: theme.accent_color }}
        />
      </div>
      <div className="text-xs opacity-75">
        Aperçu du thème
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement des thèmes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gestionnaire de Thèmes</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les thèmes visuels de cet univers
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Thème
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTheme ? 'Modifier le Thème' : 'Créer un Nouveau Thème'}
              </DialogTitle>
              <DialogDescription>
                Configurez les couleurs et l'apparence de votre thème
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Informations</TabsTrigger>
                  <TabsTrigger value="colors">Couleurs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom du Thème</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Thème Sombre"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Thème actif</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description du thème..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Aperçu</Label>
                    <ThemePreview theme={formData} />
                  </div>
                </TabsContent>
                
                <TabsContent value="colors" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary_color">Couleur Principale</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="secondary_color">Couleur Secondaire</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          placeholder="#1E40AF"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="accent_color">Couleur d'Accent</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="accent_color"
                          type="color"
                          value={formData.accent_color}
                          onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.accent_color}
                          onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                          placeholder="#F59E0B"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="background_color">Couleur de Fond</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="background_color"
                          type="color"
                          value={formData.background_color}
                          onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.background_color}
                          onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                          placeholder="#1F2937"
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="text_color">Couleur du Texte</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="text_color"
                          type="color"
                          value={formData.text_color}
                          onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.text_color}
                          onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                          placeholder="#F9FAFB"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Aperçu en Temps Réel</Label>
                    <ThemePreview theme={formData} />
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingTheme ? 'Mettre à Jour' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <Card key={theme.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {theme.name}
                    {theme.is_active && (
                      <Badge variant="default" className="text-xs">
                        Actif
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {theme.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ThemePreview theme={theme} />
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(theme)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le thème</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer ce thème ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(theme.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                {!theme.is_active && (
                  <Button
                    size="sm"
                    onClick={() => handleActivateTheme(theme.id)}
                  >
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {themes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Palette className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun thème</h3>
            <p className="text-muted-foreground text-center mb-4">
              Créez votre premier thème pour personnaliser l'apparence de cet univers.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un Thème
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UniverseThemeManager;