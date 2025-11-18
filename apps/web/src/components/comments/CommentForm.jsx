import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/utils/trpc';

const MAX_COMMENT_LENGTH = 500;

const CommentForm = ({ customRangerId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const createMutation = trpc.comments.create.useMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    if (content.length > MAX_COMMENT_LENGTH) return;

    try {
      await createMutation.mutateAsync({
        customRangerId,
        content: content.trim(),
      });
      setContent('');
      onCommentAdded?.();
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const remainingChars = MAX_COMMENT_LENGTH - content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border border-border rounded-lg bg-muted/50">
      <div>
        <label htmlFor="comment" className="text-sm font-medium block mb-2">
          Add a comment
        </label>
        <Textarea
          id="comment"
          placeholder="Share your thoughts about this ranger..."
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
          disabled={createMutation.isPending}
          rows={3}
          className="resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {remainingChars} characters remaining
          </p>
          {remainingChars < 0 && (
            <p className="text-xs text-destructive">Exceeds limit</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={createMutation.isPending || !content.trim() || remainingChars < 0}
        className="w-full"
      >
        {createMutation.isPending ? 'Posting...' : 'Post Comment'}
      </Button>
    </form>
  );
};

export default CommentForm;
