import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { getColor } from '../utils/helpers';
import { useDialog } from '../contexts/DialogContext';
import { useAuth } from '../contexts/AuthContext';
import { trpc } from '../utils/trpc';
import RangerCard from '../components/cards/RangerCard';
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
import { Loader2, UserPlus } from 'lucide-react';

const CreateCustomRanger = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showError, showWarning, showToast } = useDialog();
  const { isAuthenticated } = useAuth();
  const trpcUtils = trpc.useUtils();
  const [teams, setTeams] = useState([]);
  
  // Check if we're cloning from location state
  const clonedData = location.state?.clonedData;
  
  const [formData, setFormData] = useState({
    name: clonedData?.name || '',
    username: 'local-user',
    title: clonedData?.title || '',
    cardTitle: clonedData?.cardTitle || '',
    color: clonedData?.color || 'red',
    type: clonedData?.type || 'core',
    abilityName: clonedData?.abilityName || '',
    ability: clonedData?.ability || '',
    teamId: clonedData?.teamId || '',
    customTeamName: clonedData?.customTeamName || '',
    teamPosition: clonedData?.teamPosition || 1,
    published: false,
  });
  const [deck, setDeck] = useState(clonedData?.deck || []);
  const [extraCharacters, setExtraCharacters] = useState(clonedData?.extraCharacters || []);
  const [editingCardIndex, setEditingCardIndex] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isRangerSelectorOpen, setIsRangerSelectorOpen] = useState(false);
  const [isCardSelectorOpen, setIsCardSelectorOpen] = useState(false);
  const [rangerSelectorMode, setRangerSelectorMode] = useState('add');
  const [replacingCharacterIndex, setReplacingCharacterIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCard, setCurrentCard] = useState({
    name: '',
    energyCost: '0',
    type: 'attack',
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
    const fetchTeams = async () => {
      const teamsCollection = database.get('teams');
      const fetchedTeams = await teamsCollection.query(Q.where('published', true)).fetch();
      setTeams(fetchedTeams);
    };
    fetchTeams();
  }, []);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
      // Replace primary character fields
      setFormData(prev => ({
        ...prev,
        name: characterData.name,
        title: characterData.title,
        abilityName: characterData.abilityName,
        ability: characterData.ability
      }));
    } else if (rangerSelectorMode === 'replace') {
      // Replace extra character
      const updated = [...extraCharacters];
      updated[replacingCharacterIndex] = characterData;
      setExtraCharacters(updated);
      setReplacingCharacterIndex(null);
    } else {
      // Add as extra character
      setExtraCharacters(prev => [...prev, characterData]);
    }
  };

  const handleAddOfficialCards = (cards) => {
    setDeck(prev => [...prev, ...cards]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      setIsSubmitting(true);
      const customRangersCollection = database.get('custom_rangers');
      const slug = generateSlug(formData.name);
      let createdRanger = null;

      await database.write(async () => {
        createdRanger = await customRangersCollection.create((ranger) => {
          ranger.name = formData.name;
          ranger.slug = slug;
          ranger.username = formData.username;
          ranger.title = formData.title || null;
          ranger.cardTitle = formData.cardTitle || null;
          ranger.color = formData.color;
          ranger.type = formData.type;
          ranger.abilityName = formData.abilityName;
          ranger.ability = formData.ability;
          ranger.deck = JSON.stringify(deck);
          ranger.extraCharacters = extraCharacters.length > 0 ? JSON.stringify(extraCharacters) : null;
          ranger.teamId = formData.teamId || null;
          ranger.customTeamName = formData.customTeamName || null;
          ranger.teamPosition = formData.teamPosition || null;
          ranger.published = formData.published;
          ranger.createdAt = Date.now();
          ranger.updatedAt = Date.now();
        });
      });

      // Sync to cloud if authenticated
      if (isAuthenticated && createdRanger) {
        try {
          const { syncSingleRanger } = await import('../services/customRangersSync');
          await syncSingleRanger(trpcUtils.client, createdRanger.id);
        } catch (syncError) {
          console.error('Failed to sync to cloud:', syncError);
          // Don't block local creation on sync failure
        }
      }

      showToast.success('Custom ranger created successfully!');
      setTimeout(() => navigate('/my-rangers'), 1500);
    } catch (error) {
      console.error('Error creating custom ranger:', error);
      showError('Failed to create custom ranger');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-gray-100">
        {clonedData ? 'Clone Custom Ranger' : 'Create Custom Ranger'}
      </h1>
      {clonedData && (
        <p className="text-muted-foreground mb-4">
          Creating a clone - modify any fields and click Create to save.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
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
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Leader, Warrior"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Select name="color" value={formData.color} onValueChange={(value) => handleInputChange({ target: { name: 'color', value } })}>
                  <SelectTrigger id="color">
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
                <Label htmlFor="type">Type *</Label>
                <Select name="type" value={formData.type} onValueChange={(value) => handleInputChange({ target: { name: 'type', value } })}>
                  <SelectTrigger id="type">
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
                name="teamId"
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

            <div className="text-center text-muted-foreground">OR</div>

            <div className="space-y-2">
              <Label htmlFor="customTeamName">Custom Team Name</Label>
              <Input
                id="customTeamName"
                name="customTeamName"
                value={formData.customTeamName}
                onChange={handleInputChange}
                disabled={!!formData.teamId}
                placeholder="e.g., Custom Squad"
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
              <CardTitle>Deck </CardTitle>
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
                <Label htmlFor="cardTitle">Card Title (Override)</Label>
                <Input
                  id="cardTitle"
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

            <div className="space-y-4 mb-6 hidden">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Card Name</label>
                  <input
                    type="text"
                    name="name"
                    value={currentCard.name}
                    onChange={handleCardChange}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Type</label>
                  <select
                    name="type"
                    value={currentCard.type}
                    onChange={handleCardChange}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  >
                    {cardTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Description</label>
                <textarea
                  name="description"
                  value={currentCard.description}
                  onChange={handleCardChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Energy Cost</label>
                  <input
                    type="text"
                    name="energyCost"
                    value={currentCard.energyCost}
                    onChange={handleCardChange}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Shields</label>
                  <input
                    type="text"
                    name="shields"
                    value={currentCard.shields}
                    onChange={handleCardChange}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Attack Dice</label>
                  <input
                    type="number"
                    name="attackDice"
                    value={currentCard.attackDice}
                    onChange={handleCardChange}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Attack Hit</label>
                  <input
                    type="number"
                    name="attackHit"
                    value={currentCard.attackHit}
                    onChange={handleCardChange}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Count</label>
                  <input
                    type="number"
                    name="count"
                    value={currentCard.count}
                    onChange={handleCardChange}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addCardToDeck}
                  className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {editingCardIndex !== null ? 'Update Card' : `Add Card to Deck (${getTotalCardCount()}/10)`}
                </button>
                {editingCardIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCardIndex(null);
                      setCurrentCard({
                        name: '',
                        energyCost: '0',
                        type: 'attack',
                        description: '',
                        shields: '0',
                        attackDice: 0,
                        attackHit: 0,
                        count: 1,
                      });
                    }}
                    className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Deck List */}
            {deck.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 dark:text-gray-100">Current Deck:</h3>
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
                            type: card.type,
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
                            team: formData.customTeamName || '',
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

        {/* Submit */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="w-full sm:flex-1" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Ranger...
              </>
            ) : (
              'Create Ranger'
            )}
          </Button>
          <Button
            type="button"
            onClick={() => navigate('/my-rangers')}
            variant="secondary"
            className="w-full sm:flex-1"
            size="lg"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>

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
  );
};

export default CreateCustomRanger;
