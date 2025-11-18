import { Link } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { getColor } from '../utils/helpers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ColumnList = ({ title, subtitle, sortBy }) => {
  const { data, isLoading, isError } = trpc.customRangers.getPublished.useQuery(
    {
      limit: 10,
      offset: 0,
      sortBy,
    },
    {
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
    }
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base flex flex-col gap-1">
          <span>{title}</span>
          {subtitle && (
            <span className="text-xs font-normal text-muted-foreground">
              {subtitle}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading rangers...</p>
        )}
        {isError && (
          <p className="text-sm text-destructive">Failed to load rangers.</p>
        )}
        {!isLoading && !isError && (!data || data.length === 0) && (
          <p className="text-sm text-muted-foreground">No published rangers yet.</p>
        )}
        {!isLoading && !isError && data && data.length > 0 && (
          <ul className="space-y-3">
            {data.map((ranger) => (
              <li key={ranger.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{ranger.name}</p>
                  {ranger.title && (
                    <p className="text-xs text-muted-foreground truncate">{ranger.title}</p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground truncate">
                    {ranger.abilityName}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  {ranger.color && (
                    <Badge className={`text-[10px] px-2 py-0.5 text-white ${getColor(ranger.color)}`}>
                      {ranger.color.toUpperCase()}
                    </Badge>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    {typeof ranger.likes === 'number' && ranger.likes > 0
                      ? `${ranger.likes} like${ranger.likes === 1 ? '' : 's'}`
                      : 'No likes yet'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

const CommunitySection = () => {
  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="flex flex-col gap-2 mb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Community Rangers</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Discover custom rangers created by the community. Publish your own builds
            and browse the latest creations.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full mt-2 md:w-auto md:mt-0">
          <Link to="/community">View all community rangers</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ColumnList
          title="Latest Creations"
          subtitle="Newest published custom rangers"
          sortBy="recent"
        />
        <ColumnList
          title="Most Liked"
          subtitle="Top rangers by likes"
          sortBy="likes"
        />
      </div>
    </section>
  );
};

export default CommunitySection;
