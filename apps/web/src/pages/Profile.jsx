import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, User as UserIcon } from 'lucide-react';

export default function Profile() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/settings');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discord Account</CardTitle>
          <CardDescription>Information from your Discord account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Avatar and Username */}
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=128`}
                  alt={user.username}
                  className="h-20 w-20 rounded-full"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{user?.username}</h2>
                <p className="text-sm text-muted-foreground">Discord User</p>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Username</p>
                  <p className="text-sm text-muted-foreground">{user?.username}</p>
                </div>
              </div>

              {user?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="h-5 w-5" /> {/* Spacer */}
                <div>
                  <p className="text-sm font-medium">Discord ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{user?.discordId}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
