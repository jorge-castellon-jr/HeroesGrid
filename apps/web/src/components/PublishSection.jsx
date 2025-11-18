import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const PublishSection = ({ published, onPublishChange }) => {
  const { isAuthenticated } = useAuth();

  // Only show publish section for authenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Publish</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="publish-toggle">Publish to Community</Label>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              When published, this ranger will appear on the Community page and can be
              viewed by other players.
            </p>
          </div>
          <Switch
            id="publish-toggle"
            checked={published}
            onCheckedChange={onPublishChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PublishSection;
