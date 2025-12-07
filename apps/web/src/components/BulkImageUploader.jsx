import { useState } from 'react';
import { database } from '../database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { trpc } from '../utils/trpc';

const R2_DOMAIN = 'https://assets.heroesgrid.com';

export default function BulkImageUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [uploadLog, setUploadLog] = useState([]);

  // tRPC mutation
  const uploadMutation = trpc.r2.uploadAsset.useMutation();

  const addLog = (message, status = 'info') => {
    setUploadLog(prev => [...prev, { message, status, timestamp: new Date().toLocaleTimeString() }]);
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const uploadImageToR2 = async (imageUrl, filename) => {
    try {
      // Convert relative paths to absolute URLs
      let absoluteUrl = imageUrl;
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        // Relative path under Vite public/ served at root
        absoluteUrl = `${window.location.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }

      // Fetch the image
      const response = await fetch(absoluteUrl);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

      const blob = await response.blob();
      const base64Data = await blobToBase64(blob);

      // Upload to R2 via tRPC
      const result = await uploadMutation.mutateAsync({
        filename,
        contentType: blob.type || 'application/octet-stream',
        data: base64Data,
      });

      return result.url;
    } catch (error) {
      throw new Error(`Failed to upload ${filename}: ${error.message}`);
    }
  };

  const updateRangerImageUrl = async (rangerId, newImageUrl) => {
    try {
      await database.write(async () => {
        const ranger = await database.get('rangers').find(rangerId);
        await ranger.update((r) => {
          r.imageUrl = newImageUrl;
        });
      });
    } catch (error) {
      throw new Error(`Failed to update ranger: ${error.message}`);
    }
  };

  const handleBulkUpload = async () => {
    try {
      setIsUploading(true);
      setUploadLog([]);
      setProgress({ current: 0, total: 0 });

      addLog('Starting bulk image upload...');

      // Get all rangers with images
      const rangers = await database.get('rangers').query().fetch();
      const rangersWithImages = rangers.filter(r => r.imageUrl && r.imageUrl.trim());

      setProgress({ current: 0, total: rangersWithImages.length });
      addLog(`Found ${rangersWithImages.length} rangers with images`);

      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < rangersWithImages.length; i++) {
        const ranger = rangersWithImages[i];
        const currentProgress = i + 1;

        try {
          // Skip if already on R2 domain
          if (ranger.imageUrl.startsWith('https://assets.heroesgrid.com')) {
            addLog(`[${currentProgress}/${rangersWithImages.length}] Skipped ${ranger.name} (already on R2)`, 'warning');
            setProgress({ current: currentProgress, total: rangersWithImages.length });
            successCount++; // Count as success since already done
            continue;
          }

          addLog(`[${currentProgress}/${rangersWithImages.length}] Uploading ${ranger.name}...`);

          // Extract filename, preserving directory structure under /assets/
          let filename;
          if (ranger.imageUrl.startsWith('http://') || ranger.imageUrl.startsWith('https://')) {
            const urlObj = new URL(ranger.imageUrl);
            const pathname = urlObj.pathname;
            // Extract everything after /assets/ if present
            const assetsIndex = pathname.indexOf('/assets/');
            filename = assetsIndex !== -1 ? pathname.substring(assetsIndex + 1) : pathname.split('/').pop();
          } else {
            // Relative path - keep structure if it starts with /assets/
            filename = ranger.imageUrl.startsWith('/assets/') ? ranger.imageUrl.substring(1) : ranger.imageUrl;
          }

          // Upload to R2
          const newImageUrl = await uploadImageToR2(ranger.imageUrl, filename);

          // Update ranger in database
          await updateRangerImageUrl(ranger.id, newImageUrl);

          addLog(`✓ ${ranger.name} uploaded successfully`, 'success');
          successCount++;
        } catch (error) {
          addLog(`✗ ${ranger.name} failed: ${error.message}`, 'error');
          addLog('Stopping upload due to error', 'error');
          throw error; // Stop on first failure
        }

        setProgress({ current: currentProgress, total: rangersWithImages.length });
      }

      addLog(`\nUpload complete! Success: ${successCount}, Failed: ${failureCount}`, successCount > 0 ? 'success' : 'error');
      toast.success(`Uploaded ${successCount} images, ${failureCount} failed`);
    } catch (error) {
      addLog(`Fatal error: ${error.message}`, 'error');
      toast.error(`Bulk upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Bulk Image Uploader</CardTitle>
        <CardDescription>Upload all ranger images to R2 and update URLs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleBulkUpload}
          disabled={isUploading}
          className="w-full"
          size="lg"
        >
          {isUploading ? `Uploading... (${progress.current}/${progress.total})` : 'Upload All Images to R2'}
        </Button>

        {progress.total > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {progress.current} / {progress.total} images processed
            </p>
          </div>
        )}

        {uploadLog.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-3 max-h-64 overflow-y-auto">
            <div className="space-y-1 font-mono text-xs">
              {uploadLog.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 ${
                    log.status === 'success'
                      ? 'text-green-600 dark:text-green-400'
                      : log.status === 'error'
                        ? 'text-red-600 dark:text-red-400'
                        : log.status === 'warning'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span className="text-gray-500 dark:text-gray-600 flex-shrink-0">{log.timestamp}</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
