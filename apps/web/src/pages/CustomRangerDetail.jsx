import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { getColor } from '../utils/helpers';
import { useDialog } from '../contexts/DialogContext';
import RangerCard from '../components/cards/RangerCard';
import CardEditorModal from '../components/CardEditorModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CustomRangerDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showError, showWarning, showConfirm, showToast } = useDialog();
  const [ranger, setRanger] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState(null);
  const [deck, setDeck] = useState([]);
  const [editingCardIndex, setEditingCardIndex] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
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
        createdAt: rangerRecord.createdAt,
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
      });
      setDeck(rangerData.deck);
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
          r.teamId = formData.teamId || null;
          r.customTeamName = formData.customTeamName || null;
          r.teamPosition = formData.teamPosition || null;
          r.updatedAt = Date.now();
        });
      });

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

  if (isEditing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 dark:text-gray-100">Edit Custom Ranger</h1>

          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
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

            {/* Ability */}
            <Card>
              <CardHeader>
                <CardTitle>Ability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

            {/* Deck Editor */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Deck ({getTotalCardCount()}/10 cards)</CardTitle>
                  <Button type="button" onClick={() => setIsCardModalOpen(true)}>
                    Add Card
                  </Button>
                </div>
              </CardHeader>
              <CardContent>

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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                                attack: parseInt(card.attackDice) > 0 ? [{ value: parseInt(card.attackDice), fixed: false }] : [],
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
            <div className="flex gap-4">
              <Button onClick={handleSave} className="flex-1" size="lg">
                Save Changes
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  fetchRanger();
                }}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2 dark:text-gray-100">{ranger.name}</h1>
              {ranger.title && <p className="text-xl text-gray-600 dark:text-gray-300">{ranger.title}</p>}
            </div>
            <span className={`px-4 py-2 rounded ${getColor(ranger.color)} text-white font-semibold`}>
              {ranger.color.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{ranger.abilityName}</CardTitle>
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


        {/* Deck */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Deck</CardTitle>
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
                        attack: parseInt(card.attackDice) > 0 ? [{ value: parseInt(card.attackDice), fixed: false }] : [],
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
        <div className="flex gap-4">
          <Button onClick={() => setIsEditing(true)} className="flex-1" size="lg">
            Edit Ranger
          </Button>
          <Button onClick={handleDelete} variant="destructive" size="lg">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomRangerDetail;
