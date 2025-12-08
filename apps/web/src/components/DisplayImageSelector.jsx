import { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function DisplayImageSelector({ ranger, onClose, onSave }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({});
  const [formData, setFormData] = useState({
    filename: '',
    x: 1,
    y: 1,
  });

  // Fetch available images from R2 (skip if already has an image selected)
  const hasExistingImage = !!ranger?.rangerCards?.displayImage;
  const { data: images, isLoading } = trpc.r2.listAssetsByPath.useQuery(
    { path: 'ranger-character' },
    { enabled: !hasExistingImage }
  );

  useEffect(() => {
    if (ranger?.rangerCards?.displayImage) {
      const parsed = typeof ranger.rangerCards.displayImage === 'string'
        ? JSON.parse(ranger.rangerCards.displayImage)
        : ranger.rangerCards.displayImage;
      setFormData(parsed);
      setSelectedImage(parsed.filename);
    }
  }, [ranger]);

  // Load image dimensions mapping
  useEffect(() => {
    fetch('/ranger-image-dimensions.json')
      .then(res => res.json())
      .then(data => setImageDimensions(data.images || {}))
      .catch(err => console.error('Failed to load image dimensions:', err));
  }, []);

  const handleSave = () => {
    onSave({
      ...formData,
      filename: selectedImage,
    });
  };

  const handleReset = () => {
    onSave(null);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Display Image for {ranger?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">

          {selectedImage ? (
            <>
              <div className="border rounded-lg p-4 mb-4">
                <img
                  src={`https://assets.heroesgrid.com/assets/ranger-character/${selectedImage}`}
                  alt={selectedImage}
                  className="w-full h-auto max-h-96 object-contain"
                />
                <p className="text-sm text-center mt-2 text-gray-600 dark:text-gray-400">{selectedImage}</p>
                <Button
                  onClick={() => setSelectedImage(null)}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                >
                  Choose Different Image
                </Button>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold">Sprite Sheet Position</h3>
                  {imageDimensions[selectedImage] && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Grid: {imageDimensions[selectedImage].columns} × {imageDimensions[selectedImage].rows}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="x">Column (x)</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => setFormData({ ...formData, x: Math.max(1, formData.x - 1) })}
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                        >
                          −
                        </Button>
                        <Input
                          id="x"
                          type="number"
                          value={formData.x}
                          onChange={(e) => setFormData({ ...formData, x: parseInt(e.target.value) || 1 })}
                          min="1"
                          className="text-center"
                        />
                        <Button
                          type="button"
                          onClick={() => setFormData({ ...formData, x: formData.x + 1 })}
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="y">Row (y)</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => setFormData({ ...formData, y: Math.max(1, formData.y - 1) })}
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                        >
                          −
                        </Button>
                        <Input
                          id="y"
                          type="number"
                          value={formData.y}
                          onChange={(e) => setFormData({ ...formData, y: parseInt(e.target.value) || 1 })}
                          min="1"
                          className="text-center"
                        />
                        <Button
                          type="button"
                          onClick={() => setFormData({ ...formData, y: formData.y + 1 })}
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
              </div>
            </>
          ) : isLoading ? (
            <p>Loading images...</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {images?.map((img) => (
                <div
                  key={img.key}
                  onClick={() => setSelectedImage(img.filename)}
                  className="border-2 rounded-lg p-2 cursor-pointer transition hover:border-blue-500 border-gray-300"
                >
                  <img
                    src={`https://assets.heroesgrid.com/${img.key}`}
                    alt={img.filename}
                    className="w-full h-32 object-contain mb-2"
                  />
                  <p className="text-xs truncate">{img.filename}</p>
                </div>
              ))}
            </div>
          )}

        </div>
        <DialogFooter className="flex gap-2">
          <Button onClick={handleReset} variant="destructive">
            Reset to Null
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedImage}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
