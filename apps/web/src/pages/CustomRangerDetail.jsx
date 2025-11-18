import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { getColor } from '../utils/helpers';
import { useDialog } from '../contexts/DialogContext';
import { useAuth } from '../contexts/AuthContext';
import { trpc } from '../utils/trpc';
import RangerCard from '../components/cards/RangerCard';
import PublishSection from '../components/PublishSection';
import ShareButton from '../components/ShareButton';
import CardEditorModal from '../components/CardEditorModal';
import CharacterCardEditor from '../components/CharacterCardEditor';
import ExistingRangerSelector from '../components/ExistingRangerSelector';
import ExistingCardSelector from '../components/ExistingCardSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { UserPlus } from 'lucide-react';

const CustomRangerDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showError, showWarning, showConfirm, showToast } = useDialog();
  const { isAuthenticated, user } = useAuth();
  const trpcUtils = trpc.useUtils();
  const [ranger, setRanger] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState(null);
  const [deck, setDeck] = useState([]);
  const [extraCharacters, setExtraCharacters] = useState([]);
  const [editingCardIndex, setEditingCardIndex] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isRangerSelectorOpen, setIsRangerSelectorOpen] = useState(false);
  const [isCardSelectorOpen, setIsCardSelectorOpen] = useState(false);
  const [rangerSelectorMode, setRangerSelectorMode] = useState('add');
  const [replacingCharacterIndex, setReplacingCharacterIndex] = useState(null);
  const [currentCard, setCurrentCard] = useState({
    name: '',
    energyCost: '0',
    type: 'attack',
    customType: '',
    description: '',
    shields: '0',
    attackDice: 0,
    attackHit: 0,
    count: 1,
  });

  const colors = ['red', 'blue', 'yellow', 'black', 'pink', 'green', 'white', 'gold', 'silver', 'purple', 'orange'];
  const types = [
    { value: 'core', label: 'Core' },
    { value: 'sixth', label: 'Sixth Ranger' },
    { value: 'extra', label: 'Extra' },
    { value: 'ally', label: 'Ally' },
  ];
  const cardTypes = ['attack', 'maneuver', 'reaction'];

  useEffect(() => {
    fetchRanger();
    fetchTeams();
  }, [slug]);

  const fetchTeams = async () => {
    const teamsCollection = database.get('teams');
    const fetchedTeams = await teamsCollection.query(Q.where('published', true)).fetch();
    setTeams(fetchedTeams);
  };

  const fetchRanger = async () => {
    try {
      const customRangersCollection = database.get('custom_rangers');
      const fetchedRangers = await customRangersCollection.query(Q.where('slug', slug)).fetch();

      if (fetchedRangers.length === 0) {
        showError('Ranger not found');
        navigate('/my-rangers');
        return;
      }

      const rangerRecord = fetchedRangers[0];
      let teamName = rangerRecord.customTeamName;

      if (rangerRecord.teamId) {
        try {
          const team = await rangerRecord.team.fetch();
          teamName = team?.name || 'Unknown Team';
        } catch (err) {
          console.error('Error fetching team:', err);
          teamName = 'Unknown Team';
        }
      }

      const rangerData = {
        id: rangerRecord.id,
        name: rangerRecord.name,
        slug: rangerRecord.slug,
        title: rangerRecord.title,
        cardTitle: rangerRecord.cardTitle,
        color: rangerRecord.color,
        type: rangerRecord.type,
        abilityName: rangerRecord.abilityName,
        ability: rangerRecord.ability,
        teamId: rangerRecord.teamId || '',
        customTeamName: rangerRecord.customTeamName || '',
        teamName: teamName || 'No Team',
        teamPosition: rangerRecord.teamPosition,
        deck: JSON.parse(rangerRecord.deck || '[]'),
        extraCharacters: rangerRecord.extraCharacters ? JSON.parse(rangerRecord.extraCharacters) : [],
        createdAt: rangerRecord.createdAt,
        published: rangerRecord.published,
        record: rangerRecord,
      };

      setRanger(rangerData);
      setFormData({
        name: rangerData.name,
        title: rangerData.title || '',
        cardTitle: rangerData.cardTitle || '',
        color: rangerData.color,
        type: rangerData.type,
        abilityName: rangerData.abilityName,
        ability: rangerData.ability,
        teamId: rangerData.teamId,
        customTeamName: rangerData.customTeamName,
        teamPosition: rangerData.teamPosition || 1,
        published: rangerData.published,
      });
      setDeck(rangerData.deck);
      setExtraCharacters(rangerData.extraCharacters);
    } catch (error) {
      console.error('Error fetching ranger:', error);
      showError('Failed to load ranger');
      navigate('/my-rangers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCurrentCard((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addCardToDeck = () => {
    if (!currentCard.name) {
      showWarning('Card name is required');
      return;
    }

    if (editingCardIndex !== null) {
      // Update existing card
      setDeck((prev) => prev.map((card, idx) =>
        idx === editingCardIndex ? { ...currentCard } : card
      ));
      setEditingCardIndex(null);
    } else {
      // Add new card
      setDeck((prev) => [...prev, { ...currentCard }]);
    }

    setCurrentCard({
      name: '',
      energyCost: '0',
      type: 'attack',
      customType: '',
      description: '',
      shields: '0',
      attackDice: 0,
      attackHit: 0,
      count: 1,
    });
    setIsCardModalOpen(false);
  };

  const editCard = (index) => {
    setCurrentCard({ ...deck[index] });
    setEditingCardIndex(index);
    setIsCardModalOpen(true);
  };

  const updateCardCount = (index, count) => {
    setDeck((prev) => prev.map((card, idx) =>
      idx === index ? { ...card, count } : card
    ));
  };

  const removeCard = (index) => {
    setDeck((prev) => prev.filter((_, i) => i !== index));
  };

  const getTotalCardCount = () => {
    return deck.reduce((total, card) => total + (parseInt(card.count) || 1), 0);
  };

  const handlePrefillPrimaryCharacter = () => {
    setRangerSelectorMode('primary');
    setIsRangerSelectorOpen(true);
  };

  const handleAddExtraCharacter = () => {
    setRangerSelectorMode('add');
    setIsRangerSelectorOpen(true);
  };

  const handleReplaceCharacter = (index) => {
    setReplacingCharacterIndex(index);
    setRangerSelectorMode('replace');
    setIsRangerSelectorOpen(true);
  };

  const handleRangerSelect = (characterData) => {
    if (rangerSelectorMode === 'primary') {
      setFormData(prev => ({
        ...prev,
        name: characterData.name,
        title: characterData.title,
        abilityName: characterData.abilityName,
        ability: characterData.ability
      }));
    } else if (rangerSelectorMode === 'replace') {
      const updated = [...extraCharacters];
      updated[replacingCharacterIndex] = characterData;
      setExtraCharacters(updated);
      setReplacingCharacterIndex(null);
    } else {
      setExtraCharacters(prev => [...prev, characterData]);
    }
  };

  const handleAddOfficialCards = (cards) => {
    setDeck(prev => [...prev, ...cards]);
  };

  const handleSave = async () => {
    if (!formData.name) {
      showWarning('Ranger name is required');
      return;
    }

    if (!formData.teamId && !formData.customTeamName) {
      showWarning('Please select a team or enter a custom team name');
      return;
    }

    if (formData.teamId && formData.customTeamName) {
      showWarning('Please select either an official team OR a custom team name, not both');
      return;
    }

    try {
      await database.write(async () => {
        await ranger.record.update((r) => {
          r.name = formData.name;
          r.title = formData.title || null;
          r.cardTitle = formData.cardTitle || null;
          r.color = formData.color;
          r.type = formData.type;
          r.abilityName = formData.abilityName;
          r.ability = formData.ability;
          r.deck = JSON.stringify(deck);
          r.extraCharacters = extraCharacters.length > 0 ? JSON.stringify(extraCharacters) : null;
          r.teamId = formData.teamId || null;
          r.customTeamName = formData.customTeamName || null;
          r.teamPosition = formData.teamPosition || null;
          r.published = formData.published;
          r.updatedAt = Date.now();
        });
      });

      // Sync to cloud if authenticated
      if (isAuthenticated) {
        try {
          const { syncSingleRanger } = await import('../services/customRangersSync');
          await syncSingleRanger(trpcUtils.client, ranger.id);
        } catch (syncError) {
          console.error('Failed to sync update to cloud:', syncError);
          // Don't block local update on sync failure
        }
      }

      showToast.success('Ranger updated successfully!');
      setIsEditing(false);
      await fetchRanger();
    } catch (error) {
      console.error('Error updating ranger:', error);
      showError('Failed to update ranger');
    }
  };

  const handleDelete = async () => {
    showConfirm(
      `Are you sure you want to delete "${ranger.name}"?`,
      async () => {
        try {
          await database.write(async () => {
            await ranger.record.destroyPermanently();
          });

          // Sync deletion to cloud if authenticated
          if (isAuthenticated) {
            try {
              const { deleteSingleRangerFromCloud } = await import('../services/customRangersSync');
              await deleteSingleRangerFromCloud(trpcUtils.client, ranger.id);
            } catch (syncError) {
              console.error('Failed to sync deletion to cloud:', syncError);
              // Don't block local deletion on sync failure
            }
          }

          showToast.success('Ranger deleted successfully!');
          navigate('/my-rangers');
        } catch (error) {
          console.error('Error deleting ranger:', error);
          showError('Failed to delete ranger');
        }
      },
      'Confirm Deletion',
      'Delete'
    );
  };

  const handleQuickPublish = async () => {
    try {
      await database.write(async () => {
        await ranger.record.update((r) => {
          r.published = !ranger.published;
          r.updatedAt = Date.now();
        });
      });

      // Sync to cloud if authenticated
      if (isAuthenticated) {
        try {
          const { syncSingleRanger } = await import('../services/customRangersSync');
          await syncSingleRanger(trpcUtils.client, ranger.id);
        } catch (syncError) {
          console.error('Failed to sync to cloud:', syncError);
        }
      }

      // Update local state
      const updatedRanger = { ...ranger, published: !ranger.published };
      setRanger(updatedRanger);
      showToast.success(
        updatedRanger.published ? 'Published to community!' : 'Unpublished from community.'
      );
    } catch (error) {
      console.error('Error toggling publish:', error);
      showError('Failed to update publish status');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center dark:text-gray-100">Loading...</div>
      </div>
    );
  }

  if (!ranger) {
    return null;
  }

  const handleEditPublishChange = (published) => {
    setFormData((prev) => ({
      ...prev,
      published,
    }));
  };

  if (isEditing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 dark:text-gray-100">Edit Custom Ranger</h1>

          <div className="space-y-6">
            {/* Publish Section */}
            <PublishSection published={formData.published} onPublishChange={handleEditPublishChange} />
            {/* Primary Character */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Primary Character</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handlePrefillPrimaryCharacter}
                    className="w-full sm:w-auto"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Prefill from Official Ranger
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Main character information including name, color, type, and primary ability.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Leader, Warrior"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-color">Color *</Label>
                    <Select name="color" value={formData.color} onValueChange={(value) => handleInputChange({ target: { name: 'color', value } })}>
                      <SelectTrigger id="edit-color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Type *</Label>
                    <Select name="type" value={formData.type} onValueChange={(value) => handleInputChange({ target: { name: 'type', value } })}>
                      <SelectTrigger id="edit-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abilityName">Ability Name *</Label>
                  <Input
                    id="abilityName"
                    name="abilityName"
                    value={formData.abilityName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ability">Ability Description *</Label>
                  <Textarea
                    id="ability"
                    name="ability"
                    value={formData.ability}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Team Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Team Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamId">Official Team</Label>
                  <Select
                    value={formData.teamId}
                    onValueChange={(value) => handleInputChange({ target: { name: 'teamId', value } })}
                    disabled={!!formData.customTeamName}
                  >
                    <SelectTrigger id="teamId">
                      <SelectValue placeholder="-- Select Team --" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center text-gray-500 dark:text-gray-400">OR</div>

                <div className="space-y-2">
                  <Label htmlFor="customTeamName">Custom Team Name</Label>
                  <Input
                    id="customTeamName"
                    name="customTeamName"
                    value={formData.customTeamName}
                    onChange={handleInputChange}
                    disabled={!!formData.teamId}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamPosition">Team Position</Label>
                  <Input
                    id="teamPosition"
                    type="number"
                    name="teamPosition"
                    value={formData.teamPosition}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Extra Characters */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Extra Characters</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddExtraCharacter}
                    className="w-full sm:w-auto"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add from Official Ranger
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Add additional character cards for alternate forms, power-ups, or different abilities.
                </p>
              </CardHeader>
              <CardContent>
                <CharacterCardEditor
                  extraCharacters={extraCharacters}
                  onCharactersChange={setExtraCharacters}
                  onReplaceCharacter={handleReplaceCharacter}
                />
              </CardContent>
            </Card>

            {/* Deck Editor */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Deck ({getTotalCardCount()}/10 cards)</CardTitle>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      onClick={() => setIsCardModalOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      Add Custom Card
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsCardSelectorOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      Add from Official Cards
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-cardTitle">Card Title (Override)</Label>
                    <Input
                      id="edit-cardTitle"
                      name="cardTitle"
                      value={formData.cardTitle}
                      onChange={handleInputChange}
                      placeholder="e.g., MMPR Red Ranger"
                    />
                    <p className="text-xs text-muted-foreground">Optional: Overrides title on deck cards</p>
                  </div>
                </div>

                <CardEditorModal
                  isOpen={isCardModalOpen}
                  onClose={() => {
                    setIsCardModalOpen(false);
                    setEditingCardIndex(null);
                    setCurrentCard({
                      name: '',
                      energyCost: '0',
                      type: 'attack',
                      customType: '',
                      description: '',
                      shields: '0',
                      attackDice: 0,
                      attackHit: 0,
                      count: 1,
                    });
                  }}
                  card={currentCard}
                  onCardChange={handleCardChange}
                  onSave={addCardToDeck}
                  isEditing={editingCardIndex !== null}
                />

                {/* Deck List */}
                {deck.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Current Deck:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {deck.map((card, index) => (
                        <div key={index} className="border border-border rounded-lg p-4 bg-card flex flex-col">
                          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                            <Label className="text-sm">Count:</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={card.count || 1}
                              onChange={(e) => updateCardCount(index, parseInt(e.target.value) || 1)}
                              className="w-16"
                            />
                          </div>
                          <div className="mb-3 flex-1">
                        <RangerCard
                          card={{
                            name: card.name,
                            cardTitle: formData.cardTitle || formData.title,
                            type: card.type === 'custom' ? card.customType : card.type,
                            color: formData.color.charAt(0).toUpperCase() + formData.color.slice(1),
                            energy: card.energyCost,
                            shields: card.shields,
                            text: card.description ? [card.description] : [],
                            attack: (() => {
                              const attacks = [];
                              if (parseInt(card.attackHit) > 0) {
                                attacks.push({ value: parseInt(card.attackHit), fixed: true });
                              }
                              if (parseInt(card.attackDice) > 0) {
                                attacks.push({ value: parseInt(card.attackDice), fixed: false });
                              }
                              return attacks;
                            })(),
                            team: formData.customTeamName || formData.teamName || '',
                          }}
                        />
                          </div>
                          <div className="flex gap-2 pt-3 border-t border-border">
                            <Button
                              type="button"
                              onClick={() => editCard(index)}
                              size="sm"
                              className="flex-1"
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              onClick={() => removeCard(index)}
                              variant="destructive"
                              size="sm"
                              className="flex-1"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>


            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleSave} className="w-full sm:flex-1" size="lg">
                Save Changes
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  fetchRanger();
                }}
                variant="outline"
                className="w-full sm:flex-1"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Modals */}
          <ExistingRangerSelector
            isOpen={isRangerSelectorOpen}
            onClose={() => {
              setIsRangerSelectorOpen(false);
              setReplacingCharacterIndex(null);
            }}
            onSelect={handleRangerSelect}
            mode={rangerSelectorMode === 'replace' ? 'replace' : 'add'}
          />

          <ExistingCardSelector
            isOpen={isCardSelectorOpen}
            onClose={() => setIsCardSelectorOpen(false)}
            onSelect={handleAddOfficialCards}
            mode="add"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4 -ml-4">
            <Link to="/my-rangers">
              ← Back to My Rangers
            </Link>
          </Button>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 dark:text-gray-100">{ranger.name}</h1>
              {ranger.title && <p className="text-xl text-gray-600 dark:text-gray-300">{ranger.title}</p>}
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`px-4 py-2 rounded ${getColor(ranger.color)} text-white font-semibold`}>
                {ranger.color.toUpperCase()}
              </span>
              {ranger.published && (
                <ShareButton username={user?.username || 'unknown'} slug={ranger.slug} rangerName={ranger.name} />
              )}
            </div>
          </div>
        </div>

        {/* Publish Section */}
        <PublishSection published={ranger.published} onPublishChange={handleQuickPublish} />

        {/* Primary Character */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Primary Character: {ranger.abilityName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{ranger.ability}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Team</p>
                <p className="font-medium">{ranger.teamName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{ranger.type.charAt(0).toUpperCase() + ranger.type.slice(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extra Characters */}
        {ranger.extraCharacters && ranger.extraCharacters.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Extra Characters ({ranger.extraCharacters.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ranger.extraCharacters.map((character, index) => (
                  <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <h4 className="font-semibold mb-1">{character.name}</h4>
                    {character.title && (
                      <p className="text-sm text-muted-foreground mb-2">{character.title}</p>
                    )}
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium text-sm mb-1">{character.abilityName}</p>
                      <p className="text-sm text-muted-foreground">{character.ability}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


        {/* Deck */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Deck</CardTitle>
              {ranger.deck.length > 0 && (
                <Button
                  onClick={() => navigate(`/print-to-play?rangers=${ranger.slug}`)}
                  variant="outline"
                  size="sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Deck
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {ranger.deck.length === 0 ? (
              <p className="text-muted-foreground">No cards in deck</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ranger.deck.map((card, index) => (
                  <div key={index} className="relative">
                    <RangerCard
                      card={{
                        name: card.name,
                        cardTitle: ranger.cardTitle || ranger.title,
                        type: card.type === 'custom' ? card.customType : card.type,
                        color: ranger.color.charAt(0).toUpperCase() + ranger.color.slice(1),
                        energy: card.energyCost,
                        shields: card.shields,
                        text: card.description ? [card.description] : [],
                        attack: (() => {
                          const attacks = [];
                          if (parseInt(card.attackHit) > 0) {
                            attacks.push({ value: parseInt(card.attackHit), fixed: true });
                          }
                          if (parseInt(card.attackDice) > 0) {
                            attacks.push({ value: parseInt(card.attackDice), fixed: false });
                          }
                          return attacks;
                        })(),
                        team: ranger.teamName,
                      }}
                    />
                    {(card.count && card.count > 1) && (
                      <div className="absolute top-2 right-2 bg-gray-900 text-white px-2 py-1 rounded-full text-sm font-bold">
                        ×{card.count}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => setIsEditing(true)} className="w-full sm:flex-1" size="lg">
            Edit Ranger
          </Button>
          <Button onClick={handleDelete} variant="destructive" size="lg" className="w-full sm:w-auto">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomRangerDetail;
