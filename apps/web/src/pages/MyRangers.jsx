import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { database } from '../database';
import { getColor } from '../utils/helpers';
import { useDialog } from '../contexts/DialogContext';
import { useAuth } from '../contexts/AuthContext';
import { trpc } from '../utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  autoSync,
  syncPullAndPush,
  syncPullOverride,
  syncPushOverride,
  getLastSyncTime,
} from '../services/customRangersSync';

const MyRangers = () => {
  const [customRangers, setCustomRangers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const { showError, showConfirm, showToast } = useDialog();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const trpcUtils = trpc.useUtils();

  useEffect(() => {
    fetchCustomRangers();
    setLastSync(getLastSyncTime());
    
    // Auto-sync if authenticated and last sync was more than 10 seconds ago
    // (prevents showing conflict dialog right after creating/editing)
    if (isAuthenticated) {
      const lastSyncTime = getLastSyncTime();
      const tenSecondsAgo = Date.now() - 10000;
      
      if (!lastSyncTime || lastSyncTime.getTime() < tenSecondsAgo) {
        handleAutoSync();
      }
    }
  }, [isAuthenticated]);

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

          // Sync deletion to cloud if authenticated
          if (isAuthenticated) {
            try {
              const { deleteSingleRangerFromCloud } = await import('../services/customRangersSync');
              await deleteSingleRangerFromCloud(trpcUtils.client, id);
            } catch (syncError) {
              console.error('Failed to sync deletion to cloud:', syncError);
              // Don't block local deletion on sync failure
            }
          }

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

  const handleAutoSync = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsSyncing(true);
      const result = await autoSync(trpcUtils.client);
      
      if (result.needsResolution) {
        // Show conflict resolution dialog
        setConflictData(result.comparison);
        setShowConflictDialog(true);
      } else if (result.success) {
        // Refresh local data
        await fetchCustomRangers();
        setLastSync(getLastSyncTime());
        
        if (result.strategy === 'auto-push') {
          showToast.success(`Synced ${result.pushed} rangers to cloud`);
        } else if (result.pushed > 0 || result.pulled > 0) {
          showToast.success(`Synced: pushed ${result.pushed}, pulled ${result.pulled}`);
        }
      }
    } catch (error) {
      console.error('Auto-sync error:', error);
      // Don't show error on auto-sync failure
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    if (!isAuthenticated) {
      showError('Please log in to sync your rangers');
      return;
    }
    
    try {
      setIsSyncing(true);
      const result = await syncPullAndPush(trpcUtils.client);
      
      if (result.success) {
        await fetchCustomRangers();
        setLastSync(getLastSyncTime());
        showToast.success(`Synced: pushed ${result.pushed}, pulled ${result.pulled}`);
      }
    } catch (error) {
      console.error('Manual sync error:', error);
      showError('Failed to sync rangers');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConflictResolution = async (strategy) => {
    try {
      setIsSyncing(true);
      setShowConflictDialog(false);
      
      let result;
      if (strategy === 'pull-push') {
        result = await syncPullAndPush(trpcUtils.client);
      } else if (strategy === 'pull-override') {
        result = await syncPullOverride(trpcUtils.client);
      } else if (strategy === 'push-override') {
        result = await syncPushOverride(trpcUtils.client);
      }
      
      if (result.success) {
        await fetchCustomRangers();
        setLastSync(getLastSyncTime());
        showToast.success('Sync complete!');
      }
    } catch (error) {
      console.error('Conflict resolution error:', error);
      showError('Failed to resolve sync conflict');
    } finally {
      setIsSyncing(false);
      setConflictData(null);
    }
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
        <div>
          <h1 className="text-3xl font-bold dark:text-gray-100">My Custom Rangers</h1>
          {isAuthenticated && lastSync && (
            <p className="text-sm text-muted-foreground mt-1">
              Last synced: {lastSync.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {isAuthenticated && (
            <Button
              onClick={handleManualSync}
              variant="outline"
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing...' : '☁️ Sync'}
            </Button>
          )}
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

      {/* Conflict Resolution Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sync Conflict Detected</DialogTitle>
            <DialogDescription>
              Your local and cloud data have differences. How would you like to resolve this?
            </DialogDescription>
          </DialogHeader>
          
          {conflictData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-semibold mb-1">Local</p>
                  <p>{conflictData.localCount} rangers</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-semibold mb-1">Cloud</p>
                  <p>{conflictData.cloudCount} rangers</p>
                </div>
              </div>
              
              {conflictData.conflicts.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    {conflictData.conflicts.length} conflict(s) detected
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Rangers exist in both places with different versions
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={() => handleConflictResolution('pull-push')}
              disabled={isSyncing}
              className="w-full"
            >
              Pull & Push (Merge)
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Keeps newer versions and adds missing rangers from both sides
            </p>
            
            <div className="flex gap-2 w-full mt-2">
              <Button
                onClick={() => handleConflictResolution('pull-override')}
                disabled={isSyncing}
                variant="outline"
                className="flex-1"
              >
                Pull Override
              </Button>
              <Button
                onClick={() => handleConflictResolution('push-override')}
                disabled={isSyncing}
                variant="outline"
                className="flex-1"
              >
                Push Override
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Override replaces all data on one side with the other
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRangers;
