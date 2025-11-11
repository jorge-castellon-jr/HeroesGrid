import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { database } from '../database';
import { initializeDatabase } from '../database/seed';
import SyncManager from '../components/SyncManager';

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'rangers');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filterId, setFilterId] = useState(searchParams.get('id') || '');
  const [relationData, setRelationData] = useState({ teams: [], expansions: [], seasons: [] });

  const tabs = [
    { id: 'rangers', label: 'Rangers', collection: 'rangers' },
    { id: 'teams', label: 'Teams', collection: 'teams' },
    { id: 'enemies', label: 'Enemies', collection: 'enemies' },
    { id: 'expansions', label: 'Expansions', collection: 'expansions' },
    { id: 'seasons', label: 'Seasons', collection: 'seasons' },
    { id: 'cards', label: 'Ranger Cards', collection: 'ranger_cards' },
  ];

  // Sync state from URL params (for back/forward navigation)
  useEffect(() => {
    const tab = searchParams.get('tab') || 'rangers';
    const search = searchParams.get('search') || '';
    const id = searchParams.get('id') || '';

    setActiveTab(tab);
    setSearchTerm(search);
    setSearchInput(search);
    setFilterId(id);
  }, [searchParams]);

  // Debounce search input to update searchTerm after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync URL params with state
  useEffect(() => {
    const params = {};
    if (activeTab) params.tab = activeTab;
    if (searchTerm) params.search = searchTerm;
    if (filterId) params.id = filterId;
    setSearchParams(params);
  }, [activeTab, searchTerm, filterId]);

  // Load data when tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Load relation data on mount
  useEffect(() => {
    loadRelationData();
  }, []);

  // Add keyboard shortcuts for edit modal
  useEffect(() => {
    if (!editingItem) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEditingItem(null);
      } else if (e.key === 'Enter' && !e.target.matches('textarea')) {
        // Don't trigger on Enter in textarea (for multi-line input)
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingItem]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await initializeDatabase();
      const collection = database.get(tabs.find(t => t.id === activeTab).collection);
      const records = await collection.query().fetch();
      setData(records);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelationData = async () => {
    try {
      await initializeDatabase();
      const [teams, expansions, seasons] = await Promise.all([
        database.get('teams').query().fetch(),
        database.get('expansions').query().fetch(),
        database.get('seasons').query().fetch(),
      ]);
      setRelationData({ teams, expansions, seasons });
    } catch (error) {
      console.error('Error loading relation data:', error);
    }
  };

  const getColumnConfig = (tabId) => {
    switch (tabId) {
      case 'rangers':
        return ['published', 'name', 'slug', 'title', 'abilityName', 'isOncePerBattle', 'color', 'type', 'teamPosition', 'cardTitle', 'teamId', 'expansionId', 'imageUrl'];
      case 'teams':
        return ['published', 'name', 'slug', 'seasonId', 'generation'];
      case 'enemies':
        return ['published', 'name', 'slug', 'monsterType', 'nemesisEffect', 'seasonId', 'expansionId'];
      case 'expansions':
        return ['published', 'name', 'slug'];
      case 'seasons':
        return ['published', 'name', 'slug', 'order'];
      case 'cards':
        return ['published', 'name', 'energyCost', 'type', 'description', 'shields', 'attackDice', 'attackHit', 'expansionId'];
      default:
        return ['published', 'name', 'slug'];
    }
  };

  const getColumnLabel = (columnName) => {
    const labels = {
      name: 'Name',
      slug: 'Slug',
      title: 'Title',
      color: 'Color',
      type: 'Type',
      abilityName: 'Ability Name',
      isOncePerBattle: 'Once Per Battle',
      teamPosition: 'Team Position',
      cardTitle: 'Card Title',
      teamId: 'Team ID',
      expansionId: 'Expansion ID',
      imageUrl: 'Image URL',
      seasonId: 'Season ID',
      generation: 'Generation',
      monsterType: 'Monster Type',
      nemesisEffect: 'Nemesis Effect',
      order: 'Order',
      energyCost: 'Energy Cost',
      description: 'Description',
      shields: 'Shields',
      attackDice: 'Attack Dice',
      attackHit: 'Attack Hit',
      published: 'Published',
    };
    return labels[columnName] || columnName;
  };

  const getRelationInfo = (columnName) => {
    const relations = {
      teamId: 'teams',
      expansionId: 'expansions',
      seasonId: 'seasons',
    };
    return relations[columnName];
  };

  const getRelationName = (columnName, id) => {
    if (!id) return '-';

    const relationTab = getRelationInfo(columnName);
    if (!relationTab) return id;

    const relatedItem = relationData[relationTab]?.find(item => item.id === id);
    return relatedItem?.name || id;
  };

  const handleRelationClick = (tabId, id) => {
    setActiveTab(tabId);
    setFilterId(id);
    setSearchTerm('');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setFilterId('');
    setSearchTerm('');
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (!value) {
      setSearchTerm('');
    }
    setFilterId('');
  };

  const handleEdit = (item) => {
    // Extract all fields from WatermelonDB model
    const editData = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      published: item.published,
    };

    // Add ranger-specific fields if applicable
    if (activeTab === 'rangers') {
      editData.title = item.title;
      editData.cardTitle = item.cardTitle;
      editData.color = item.color;
      editData.abilityName = item.abilityName;
      editData.ability = item.ability;
      editData.imageUrl = item.imageUrl;
      editData.type = item.type;
      editData.teamPosition = item.teamPosition;
      editData.isOncePerBattle = item.isOncePerBattle;
      editData.teamId = item.teamId;
      editData.expansionId = item.expansionId;
    }

    // Add team-specific fields
    if (activeTab === 'teams') {
      editData.seasonId = item.seasonId;
      editData.generation = item.generation;
    }

    // Add enemy-specific fields
    if (activeTab === 'enemies') {
      editData.monsterType = item.monsterType;
      editData.nemesisEffect = item.nemesisEffect;
      editData.seasonId = item.seasonId;
      editData.expansionId = item.expansionId;
    }

    // Add season-specific fields
    if (activeTab === 'seasons') {
      editData.order = item.order;
    }

    // Add card-specific fields
    if (activeTab === 'cards') {
      editData.energyCost = item.energyCost;
      editData.type = item.type;
      editData.description = item.description;
      editData.shields = item.shields;
      editData.attackDice = item.attackDice;
      editData.attackHit = item.attackHit;
      editData.expansionId = item.expansionId;
    }

    setEditingItem(editData);
  };

  const handleSave = async () => {
    try {
      await database.write(async () => {
        const record = await database.get(tabs.find(t => t.id === activeTab).collection).find(editingItem.id);
        await record.update((r) => {
          // Update all fields from editingItem
          Object.keys(editingItem).forEach(key => {
            if (key !== 'id' && key !== '_raw' && typeof editingItem[key] !== 'function') {
              r[key] = editingItem[key];
            }
          });
        });
      });
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (item) => {
    try {
      await database.write(async () => {
        const record = await database.get(tabs.find(t => t.id === activeTab).collection).find(item.id);
        await record.markAsDeleted();
      });
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleTogglePublished = async (itemId, currentValue) => {
    try {
      const collection = database.get(tabs.find(t => t.id === activeTab).collection);
      let updatedRecord;
      await database.write(async () => {
        const record = await collection.find(itemId);
        updatedRecord = await record.update((r) => {
          r.published = !currentValue;
        });
      });
      // Replace the record in local state with the updated WatermelonDB record
      setData(prevData =>
        prevData.map(item =>
          item.id === itemId ? updatedRecord : item
        )
      );
    } catch (error) {
      console.error('Error toggling published status:', error);
    }
  };

  const handleExportJSON = async () => {
    try {
      const collection = database.get(tabs.find(t => t.id === activeTab).collection);
      const records = await collection.query().fetch();

      const jsonData = records.map(r => {
        const obj = { ...r._raw };
        // Only remove WatermelonDB internal fields
        delete obj._status;
        delete obj._changed;
        return obj;
      });

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const handleResetDatabase = async () => {
    try {
      await database.write(async () => {
        await database.unsafeResetDatabase();
      });
      window.location.reload();
    } catch (error) {
      console.error('Error resetting database:', error);
      window.location.reload();
    }
  };

  const filteredData = data.filter(item => {
    // Filter by ID if specified
    if (filterId) {
      return item.id === filterId;
    }
    // Otherwise filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return item.name?.toLowerCase().includes(searchLower) ||
        item.slug?.toLowerCase().includes(searchLower) ||
        item.title?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">Data Admin</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and edit game data</p>
      </div>

      {/* Sync Manager */}
      <div className="mb-8">
        <SyncManager />
      </div>

      {/* Danger Zone */}
      <div className="mb-8 p-4 border-2 border-red-500 rounded-lg bg-red-50 dark:bg-red-900/20">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Warning: This action cannot be undone!</p>
        <button
          onClick={handleResetDatabase}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          Reset Database
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search by name, slug, or title..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="Filter by ID..."
            value={filterId}
            onChange={(e) => {
              setFilterId(e.target.value);
              setSearchTerm('');
            }}
            className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 font-mono text-sm"
          />
        </div>
        <button
          onClick={handleExportJSON}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Export JSON
        </button>
      </div>

      {/* Data Count */}
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredData.length} of {data.length} records
      </p>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200 sticky left-0 bg-gray-100 dark:bg-gray-700 z-10" style={{ minWidth: '100px', width: '100px' }}>Actions</th>
                {getColumnConfig(activeTab).map(col => (
                  <th key={col} className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200 whitespace-nowrap" style={{ minWidth: '200px', width: '200px' }}>
                    {getColumnLabel(col)}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200 whitespace-nowrap" style={{ minWidth: '300px', width: '300px' }}>ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-left sticky left-0 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 z-10" style={{ minWidth: '100px', width: '100px' }}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                  {getColumnConfig(activeTab).map(col => {
                    const relationTab = getRelationInfo(col);
                    const isRelation = relationTab && item[col];
                    const relationName = isRelation ? getRelationName(col, item[col]) : null;

                    return (
                      <td key={col} className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis" style={{ minWidth: '200px', width: '200px' }}>
                        {col === 'name' ? (
                          <span className="font-medium dark:text-white">{item[col] || '-'}</span>
                        ) : col === 'color' ? (
                          <span className={`px-2 py-1 rounded text-xs ${item[col] ? 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200' : ''
                            }`}>
                            {item[col] || '-'}
                          </span>
                        ) : col === 'description' ? (
                          <span className="max-w-xs truncate block" title={item[col]}>{item[col] || '-'}</span>
                        ) : col === 'imageUrl' ? (
                          item[col] ? (
                            <a href={item[col]} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                              View
                            </a>
                          ) : '-'
                        ) : isRelation ? (
                          <button
                            onClick={() => handleRelationClick(relationTab, item[col])}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-left"
                            title={`ID: ${item[col]}`}
                          >
                            {relationName}
                          </button>
                        ) : col === 'published' || col === 'isOncePerBattle' ? (
                          <input
                            type="checkbox"
                            checked={item[col] || false}
                            onChange={() => col === 'published' && handleTogglePublished(item.id, item[col])}
                            className="h-4 w-4 cursor-pointer"
                            disabled={col !== 'published'}
                          />
                        ) : (
                          item[col] != null ? String(item[col]) : '-'
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap overflow-hidden text-ellipsis" style={{ minWidth: '300px', width: '300px' }}>{item.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Edit {editingItem.name}</h2>

              <div className="space-y-4">
                {/* Basic Fields */}
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Name</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Slug</label>
                  <input
                    type="text"
                    value={editingItem.slug || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* Team-specific fields */}
                {activeTab === 'teams' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Season</label>
                      <select
                        value={editingItem.seasonId || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, seasonId: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select season...</option>
                        {relationData.seasons.map(season => (
                          <option key={season.id} value={season.id}>{season.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Generation</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, generation: Math.round(((editingItem.generation || 0) - 0.1) * 10) / 10 })}
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          step="any"
                          value={editingItem.generation || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, generation: parseFloat(e.target.value) || null })}
                          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, generation: Math.round(((editingItem.generation || 0) + 0.1) * 10) / 10 })}
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Season-specific fields */}
                {activeTab === 'seasons' && (
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Order</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, order: Math.round(((editingItem.order || 0) - 0.1) * 10) / 10 })}
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-bold"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        step="any"
                        value={editingItem.order || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, order: parseFloat(e.target.value) || null })}
                        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, order: Math.round(((editingItem.order || 0) + 0.1) * 10) / 10 })}
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Enemy-specific fields */}
                {activeTab === 'enemies' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Monster Type</label>
                      <select
                        value={editingItem.monsterType || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, monsterType: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select type...</option>
                        <option value="footsoldier">Footsoldier</option>
                        <option value="monster">Monster</option>
                        <option value="boss">Boss</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Nemesis Effect</label>
                      <textarea
                        value={editingItem.nemesisEffect || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, nemesisEffect: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Season</label>
                      <select
                        value={editingItem.seasonId || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, seasonId: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select season...</option>
                        {relationData.seasons.map(season => (
                          <option key={season.id} value={season.id}>{season.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Expansion</label>
                      <select
                        value={editingItem.expansionId || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, expansionId: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select expansion...</option>
                        {relationData.expansions.map(expansion => (
                          <option key={expansion.id} value={expansion.id}>{expansion.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Published field - all tables */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={editingItem.published || false}
                    onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="published" className="text-sm font-medium dark:text-gray-200">Published</label>
                </div>

                {/* Ranger-specific fields */}
                {activeTab === 'rangers' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Title</label>
                      <input
                        type="text"
                        value={editingItem.title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Card Title (Override)</label>
                      <input
                        type="text"
                        value={editingItem.cardTitle || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, cardTitle: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Type</label>
                      <select
                        value={editingItem.type || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select type...</option>
                        <option value="core">Core</option>
                        <option value="sixth">Sixth</option>
                        <option value="extra">Extra</option>
                        <option value="ally">Ally</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Team Position</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, teamPosition: Math.round(((editingItem.teamPosition || 0) - 0.1) * 10) / 10 })}
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          step="any"
                          min="1"
                          value={editingItem.teamPosition || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, teamPosition: parseFloat(e.target.value) || null })}
                          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="1-6 for red, blue, black, yellow, pink, green. 7+ for others"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, teamPosition: Math.round(((editingItem.teamPosition || 0) + 0.1) * 10) / 10 })}
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Color</label>
                      <select
                        value={editingItem.color || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select color...</option>
                        <option value="red">Red</option>
                        <option value="blue">Blue</option>
                        <option value="yellow">Yellow</option>
                        <option value="black">Black</option>
                        <option value="pink">Pink</option>
                        <option value="green">Green</option>
                        <option value="white">White</option>
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isOncePerBattle"
                        checked={editingItem.isOncePerBattle || false}
                        onChange={(e) => setEditingItem({ ...editingItem, isOncePerBattle: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor="isOncePerBattle" className="text-sm font-medium dark:text-gray-200">Once Per Battle</label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Ability Name</label>
                      <input
                        type="text"
                        value={editingItem.abilityName || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, abilityName: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Ability Description</label>
                      <textarea
                        value={editingItem.ability || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, ability: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Team</label>
                      <select
                        value={editingItem.teamId || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, teamId: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select team...</option>
                        {relationData.teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Expansion</label>
                      <select
                        value={editingItem.expansionId || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, expansionId: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select expansion...</option>
                        {relationData.expansions.map(expansion => (
                          <option key={expansion.id} value={expansion.id}>{expansion.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Image URL</label>
                      <input
                        type="text"
                        value={editingItem.imageUrl || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </>
                )}

                {/* Card-specific fields */}
                {activeTab === 'cards' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Energy Cost</label>
                      <input
                        type="text"
                        value={editingItem.energyCost || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, energyCost: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Type</label>
                      <input
                        type="text"
                        value={editingItem.type || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Description</label>
                      <textarea
                        value={editingItem.description || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Shields</label>
                      <input
                        type="text"
                        value={editingItem.shields || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, shields: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Attack Dice</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, attackDice: Math.round(((editingItem.attackDice || 0) - 0.1) * 10) / 10 })}
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          step="any"
                          value={editingItem.attackDice || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, attackDice: parseFloat(e.target.value) || null })}
                          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, attackDice: Math.round(((editingItem.attackDice || 0) + 0.1) * 10) / 10 })}
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Attack Hit</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, attackHit: Math.round(((editingItem.attackHit || 0) - 0.1) * 10) / 10 })}
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          step="any"
                          value={editingItem.attackHit || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, attackHit: parseFloat(e.target.value) || null })}
                          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, attackHit: Math.round(((editingItem.attackHit || 0) + 0.1) * 10) / 10 })}
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-200">Expansion</label>
                      <select
                        value={editingItem.expansionId || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, expansionId: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select expansion...</option>
                        {relationData.expansions.map(expansion => (
                          <option key={expansion.id} value={expansion.id}>{expansion.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
