import { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { useDialog } from '@/contexts/DialogContext';

const CommentCard = ({ comment, onDelete, onLikeChange, isAuthor }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const { showConfirm } = useDialog();
  const likeMutation = trpc.comments.like.useMutation();
  const unlikeMutation = trpc.comments.unlike.useMutation();
  const deleteMutation = trpc.comments.delete.useMutation();

  const handleToggleLike = async () => {
    try {
      if (isLiked) {
        await unlikeMutation.mutateAsync({ id: comment.id });
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await likeMutation.mutateAsync({ id: comment.id });
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
      onLikeChange?.();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = () => {
    showConfirm(
      'This action cannot be undone.',
      async () => {
        try {
          await deleteMutation.mutateAsync({ id: comment.id });
          onDelete?.();
        } catch (error) {
          console.error('Error deleting comment:', error);
        }
      },
      'Delete Comment',
      'Delete'
    );
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

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{comment.username}</p>
          <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
        </div>
        {isAuthor && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>

      <p className="text-sm text-foreground break-words whitespace-pre-wrap">{comment.content}</p>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleLike}
          className={isLiked ? 'text-red-500' : ''}
        >
          <Heart
            size={16}
            className="mr-1"
            fill={isLiked ? 'currentColor' : 'none'}
          />
          {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
        </Button>
      </div>
    </div>
  );
};

export default CommentCard;
