import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useAuth } from '@/contexts/AuthContext';
import CommentForm from './CommentForm';
import CommentCard from './CommentCard';

const CommentsSection = ({ customRangerId, creatorId }) => {
  const { user, isAuthenticated } = useAuth();
  const trpcUtils = trpc.useUtils();

  const { data: comments = [], isLoading } = trpc.comments.getByRangerId.useQuery(
    { customRangerId },
    {
      staleTime: 0,
      refetchOnMount: 'always',
    }
  );

  const handleCommentAdded = () => {
    // Refetch comments after a new one is added
    trpcUtils.comments.getByRangerId.invalidate({ customRangerId });
  };

  const handleCommentDeleted = () => {
    // Refetch comments after deletion
    trpcUtils.comments.getByRangerId.invalidate({ customRangerId });
  };

  const handleCommentLikeChanged = () => {
    // Refetch to get updated like counts
    trpcUtils.comments.getByRangerId.invalidate({ customRangerId });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAuthenticated ? (
          <CommentForm
            customRangerId={customRangerId}
            onCommentAdded={handleCommentAdded}
          />
        ) : (
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Please log in to comment on rangers
            </p>
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                isAuthor={user?.id === comment.userId}
                onDelete={handleCommentDeleted}
                onLikeChange={handleCommentLikeChanged}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsSection;
