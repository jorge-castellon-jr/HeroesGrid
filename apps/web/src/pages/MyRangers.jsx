import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { database } from '../database';
import { getColor } from '../utils/helpers';
import { useDialog } from '../contexts/DialogContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MyRangers = () => {
  const [customRangers, setCustomRangers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError, showConfirm, showToast } = useDialog();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomRangers();
  }, []);

  const fetchCustomRangers = async () => {
    try {
      const customRangersCollection = database.get('custom_rangers');
      const fetchedRangers = await customRangersCollection.query().fetch();

      // Transform to include team info
      const transformedRangers = await Promise.all(
        fetchedRangers.map(async (ranger) => {
          let teamName = ranger.customTeamName;
          if (ranger.teamId) {
            try {
              const team = await ranger.team.fetch();
              teamName = team?.name || 'Unknown Team';
            } catch (err) {
              console.error('Error fetching team:', err);
              teamName = 'Unknown Team';
            }
          }

          return {
            id: ranger.id,
            name: ranger.name,
            slug: ranger.slug,
            color: ranger.color,
            type: ranger.type,
            teamName: teamName || 'No Team',
            abilityName: ranger.abilityName,
            deck: JSON.parse(ranger.deck || '[]'),
            createdAt: ranger.createdAt,
          };
        })
      );

      // Sort by creation date (newest first)
      transformedRangers.sort((a, b) => b.createdAt - a.createdAt);

      setCustomRangers(transformedRangers);
    } catch (error) {
      console.error('Error fetching custom rangers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClone = async (id, originalName) => {
    try {
      const customRangersCollection = database.get('custom_rangers');
      const originalRanger = await customRangersCollection.find(id);

      // Prepare cloned data
      const clonedData = {
        name: `${originalName} (Clone)`,
        title: originalRanger.title || '',
        cardTitle: originalRanger.cardTitle || '',
        color: originalRanger.color,
        type: originalRanger.type,
        abilityName: originalRanger.abilityName,
        ability: originalRanger.ability,
        teamId: originalRanger.teamId || '',
        customTeamName: originalRanger.customTeamName || '',
        teamPosition: originalRanger.teamPosition || 1,
        deck: JSON.parse(originalRanger.deck || '[]'),
      };

      // Navigate to create page with cloned data
      navigate('/rangers/create', { state: { clonedData } });
    } catch (error) {
      console.error('Error cloning custom ranger:', error);
      showError('Failed to clone custom ranger');
    }
  };

  const handleDelete = async (id, name) => {
    showConfirm(
      `Are you sure you want to delete "${name}"?`,
      async () => {
        try {
          const customRangersCollection = database.get('custom_rangers');
          const ranger = await customRangersCollection.find(id);

          await database.write(async () => {
            await ranger.destroyPermanently();
          });

          // Refresh the list
          await fetchCustomRangers();
          showToast.success('Custom ranger deleted successfully!');
        } catch (error) {
          console.error('Error deleting custom ranger:', error);
          showError('Failed to delete custom ranger');
        }
      },
      'Confirm Deletion',
      'Delete'
    );
  };

  const exportRangers = () => {
    const dataStr = JSON.stringify(customRangers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-rangers-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importRangers = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      if (!Array.isArray(importedData)) {
        showError('Invalid file format');
        return;
      }

      const customRangersCollection = database.get('custom_rangers');

      await database.write(async () => {
        for (const rangerData of importedData) {
          await customRangersCollection.create((ranger) => {
            ranger.name = rangerData.name;
            ranger.slug = rangerData.slug;
            ranger.username = 'local-user';
            ranger.title = rangerData.title || null;
            ranger.color = rangerData.color;
            ranger.type = rangerData.type;
            ranger.abilityName = rangerData.abilityName;
            ranger.ability = rangerData.ability || '';
            ranger.deck = JSON.stringify(rangerData.deck || []);
            ranger.teamId = rangerData.teamId || null;
            ranger.customTeamName = rangerData.customTeamName || rangerData.teamName || null;
            ranger.teamPosition = rangerData.teamPosition || null;
            ranger.published = false;
            ranger.createdAt = Date.now();
            ranger.updatedAt = Date.now();
          });
        }
      });

      await fetchCustomRangers();
      showToast.success(`Successfully imported ${importedData.length} rangers!`);
    } catch (error) {
      console.error('Error importing rangers:', error);
      showError('Failed to import rangers. Please check the file format.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center dark:text-gray-100">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-gray-100">My Custom Rangers</h1>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <label className="cursor-pointer">
              Import
              <input type="file" accept=".json" onChange={importRangers} className="hidden" />
            </label>
          </Button>
          {customRangers.length > 0 && (
            <Button onClick={exportRangers} variant="secondary">
              Export All
            </Button>
          )}
          <Button asChild>
            <Link to="/rangers/create">
              Create New Ranger
            </Link>
          </Button>
        </div>
      </div>

      {customRangers.length === 0 ? (
        <div className="text-center py-12 dark:text-gray-100">
          <p className="text-muted-foreground text-lg mb-4">You haven't created any custom rangers yet.</p>
          <Button asChild size="lg">
            <Link to="/rangers/create">
              Create Your First Ranger
            </Link>
          </Button>
        </div>
      ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {customRangers.map((ranger) => (
            <Card key={ranger.id} className="overflow-hidden">
              <div className={`h-2 ${getColor(ranger.color)}`}></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold">{ranger.name}</h2>
                  <Badge className={`${getColor(ranger.color)} text-white border-0`}>
                    {ranger.color.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p>
                    <span className="font-semibold text-foreground">Team:</span> {ranger.teamName}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Ability:</span> {ranger.abilityName}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button asChild className="flex-1" size="sm">
                    <Link to={`/my-rangers/${ranger.slug}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button
                    onClick={() => handleClone(ranger.id, ranger.name)}
                    variant="secondary"
                    size="sm"
                  >
                    Clone
                  </Button>
                  <Button
                    onClick={() => handleDelete(ranger.id, ranger.name)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRangers;
