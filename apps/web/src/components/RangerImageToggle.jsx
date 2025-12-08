import { Button } from '@/components/ui/button';

export default function RangerImageToggle({ useImages, onToggle }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium dark:text-gray-300">
        {useImages ? '🖼️ Official Images' : '🎨 Web Safe Mode'}
      </span>
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="min-w-32"
      >
        {useImages ? 'Web Safe Mode' : 'Official Images'}
      </Button>
    </div>
  );
}
