import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { getColor } from '../utils/helpers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const COLORS = ['red', 'blue', 'yellow', 'black', 'pink', 'green', 'white', 'gold', 'silver', 'purple', 'orange'];

const TYPES = [
  { value: 'core', label: 'Core' },
  { value: 'sixth', label: 'Sixth Ranger' },
  { value: 'extra', label: 'Extra' },
  { value: 'ally', label: 'Ally' },
];

const Community = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('q') || '';
  const colorFilter = searchParams.get('color') || 'all';
  const typeFilter = searchParams.get('type') || 'all';
  const sort = searchParams.get('sort') || 'recent';

  const { data, isLoading, isError } = trpc.customRangers.getPublished.useQuery(
    {
      limit: 50,
      offset: 0,
      sortBy: sort === 'likes' || sort === 'popular' ? sort : 'recent',
    },
    {
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
    }
  );

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next);
  };

  const filteredRangers = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();

    return data.filter((ranger) => {
      if (colorFilter !== 'all' && ranger.color !== colorFilter) return false;
      if (typeFilter !== 'all' && ranger.type !== typeFilter) return false;

      if (!q) return true;

      const haystack = [
        ranger.name,
        ranger.title,
        ranger.abilityName,
        ranger.ability,
        ranger.customTeamName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [data, search, colorFilter, typeFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight dark:text-gray-100">Community Rangers</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Browse all published custom rangers. Use search, filters, and sorting to find
              new ideas for your next team.
            </p>
          </div>
          <Button asChild className="w-full md:w-auto">
            <Link to="/rangers/create">Create your own ranger</Link>
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name, ability, or team..."
                value={search}
                onChange={(e) => updateParams({ q: e.target.value || null })}
              />
            </div>
            <div>
              <Label>Color</Label>
              <Select
                value={colorFilter}
                onValueChange={(value) => updateParams({ color: value === 'all' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All colors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All colors</SelectItem>
                  {COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(value) => updateParams({ type: value === 'all' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <Label>Sort by</Label>
              <Select
                value={sort}
                onValueChange={(value) => updateParams({ sort: value === 'recent' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="likes">Most liked</SelectItem>
                  <SelectItem value="popular">Most viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading community rangers...</p>
      )}
      {isError && (
        <p className="text-sm text-destructive">Failed to load community rangers.</p>
      )}

      {!isLoading && !isError && filteredRangers.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No rangers found. Try adjusting your search or filters.
        </p>
      )}

      {!isLoading && !isError && filteredRangers.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRangers.map((ranger) => (
            <Link
              key={ranger.id}
              to={`/community/${encodeURIComponent(ranger.username || 'unknown')}/${ranger.slug}`}
              className="no-underline"
            >
              <Card className="flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold truncate">{ranger.name}</h2>
                      {ranger.title && (
                        <p className="text-sm text-muted-foreground truncate">{ranger.title}</p>
                      )}
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        by {ranger.username || 'unknown'}
                      </p>
                    </div>
                    {ranger.color && (
                      <Badge className={`text-[11px] px-2 py-0.5 text-white ${getColor(ranger.color)}`}>
                        {ranger.color.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    {ranger.customTeamName && (
                      <p>
                        <span className="font-semibold text-foreground">Team:</span>{' '}
                        {ranger.customTeamName}
                      </p>
                    )}
                    {ranger.abilityName && (
                      <p>
                        <span className="font-semibold text-foreground">Ability:</span>{' '}
                        {ranger.abilityName}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {ranger.type && ranger.type.length > 0
                        ? ranger.type.charAt(0).toUpperCase() + ranger.type.slice(1)
                        : 'Unknown type'}
                    </span>
                    <span>
                      {(ranger.likes || 0) > 0 ? `${ranger.likes} likes` : 'No likes yet'}
                      {' · '}
                      {(ranger.views || 0) > 0 ? `${ranger.views} views` : '0 views'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
