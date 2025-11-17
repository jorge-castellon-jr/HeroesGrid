import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User } from 'lucide-react';

export default function AuthButton() {
  const { isAuthenticated, user, login, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Button variant="outline" disabled size="sm">
        Loading...
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button onClick={login} variant="default" size="sm" className="gap-2">
        <LogIn className="h-4 w-4" />
        Login with Discord
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {user?.avatar ? (
            <img
              src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=32`}
              alt={user.username}
              className="h-5 w-5 rounded-full"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="hidden md:inline">{user?.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.username}</span>
            {user?.email && (
              <span className="text-xs text-muted-foreground truncate">
                {user?.email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2 cursor-pointer">
          <User className="h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout} className="gap-2 cursor-pointer">
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
