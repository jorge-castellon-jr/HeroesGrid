import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDialog } from '@/contexts/DialogContext';

const ShareButton = ({ username, slug, rangerName }) => {
  const { showToast } = useDialog();

  const handleShare = async () => {
    const communityUrl = `${window.location.origin}/community/${encodeURIComponent(username)}/${slug}`;

    // Try to use the Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${rangerName}`,
          text: `I created a custom ranger called "${rangerName}" on HeroesGrid!`,
          url: communityUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(communityUrl);
        showToast.success('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        showToast.error('Failed to copy link');
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      title="Share this ranger"
    >
      <Share2 size={16} className="mr-1" />
      Share
    </Button>
  );
};

export default ShareButton;
