import { useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { useDialog } from '@/contexts/DialogContext';
import NotificationCard from './NotificationCard';

const NotificationsList = () => {
  const { showConfirm } = useDialog();
  const trpcUtils = trpc.useUtils();

  const { data: notifications = [], isLoading } = trpc.notifications.getAll.useQuery(
    { limit: 50, offset: 0 },
    {
      staleTime: 0,
      refetchOnMount: 'always',
    }
  );

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation();
  const deleteAllMutation = trpc.notifications.deleteAll.useMutation();

  const handleNotificationDeleted = () => {
    trpcUtils.notifications.getAll.invalidate();
    trpcUtils.notifications.getUnreadCount.invalidate();
  };

  const handleNotificationRead = () => {
    trpcUtils.notifications.getAll.invalidate();
    trpcUtils.notifications.getUnreadCount.invalidate();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      trpcUtils.notifications.getAll.invalidate();
      trpcUtils.notifications.getUnreadCount.invalidate();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteAll = () => {
    showConfirm(
      'This will permanently delete all your notifications.',
      async () => {
        try {
          await deleteAllMutation.mutateAsync();
          trpcUtils.notifications.getAll.invalidate();
          trpcUtils.notifications.getUnreadCount.invalidate();
        } catch (error) {
          console.error('Error deleting all notifications:', error);
        }
      },
      'Delete All Notifications',
      'Delete All'
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bell size={20} />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-white bg-blue-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteAll}
                disabled={deleteAllMutation.isPending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell size={32} className="mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll be notified when someone likes or comments on your rangers
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onDelete={handleNotificationDeleted}
                  onMarkAsRead={handleNotificationRead}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsList;
