import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trpc } from '@/utils/trpc';
import { useAuth } from '@/contexts/AuthContext';

const NotificationBadge = () => {
  const { isAuthenticated } = useAuth();

  const { data: unreadCount = 0 } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link
      to="/notifications"
      className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      title="Notifications"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBadge;
