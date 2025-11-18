import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';

const NotificationCard = ({ notification, onDelete, onMarkAsRead }) => {
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const deleteMutation = trpc.notifications.delete.useMutation();

  const handleMarkAsRead = async () => {
    try {
      await markAsReadMutation.mutateAsync({ id: notification.id });
      onMarkAsRead?.();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: notification.id });
      onDelete?.();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(date).toLocaleDateString();
  };

  const getNotificationMessage = () => {
    if (notification.type === 'like') {
      return `${notification.actorUsername} liked your ranger`;
    }
    if (notification.type === 'comment') {
      return `${notification.actorUsername} commented on your ranger`;
    }
    return 'New notification';
  };

  return (
    <div
      className={`flex items-start justify-between gap-3 p-3 rounded-lg border transition-colors ${
        notification.read
          ? 'bg-background border-border'
          : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notification.read ? 'text-foreground' : 'font-semibold text-foreground'}`}>
          {getNotificationMessage()}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{formatDate(notification.createdAt)}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAsRead}
            disabled={markAsReadMutation.isPending}
            className="h-8 w-8 p-0"
            title="Mark as read"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          title="Delete notification"
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
};

export default NotificationCard;
