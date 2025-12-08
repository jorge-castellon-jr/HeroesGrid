import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const r2Router = router({
  uploadAsset: publicProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        data: z.string(), // Base64 encoded data
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { filename, contentType, data } = input;
      
      console.log('R2 Upload Request:', { filename, contentType, dataLength: data?.length });
      
      // Validate filename to prevent path traversal
      if (filename.includes('..')) {
        throw new Error('Invalid filename - path traversal detected');
      }

      // Remove leading slash if present, keep directory structure
      const key = filename.startsWith('/') ? filename.substring(1) : filename;

      try {
        // Convert base64 string to ArrayBuffer for R2
        const binaryString = atob(data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        console.log('Bytes size:', bytes.length);
        
        // Use the buffer directly
        await ctx.env.R2.put(key, bytes.buffer, {
          httpMetadata: {
            contentType: contentType || 'application/octet-stream',
          },
        });
        console.log('Upload successful:', key);

        return {
          success: true,
          key,
          url: `https://assets.heroesgrid.com/${key}`,
        };
      } catch (error) {
        console.error('R2 Upload Error:', error);
        throw new Error(`Failed to upload to R2: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),

  deleteAsset: publicProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { key } = input;

      if (!key.startsWith('assets/')) {
        throw new Error('Invalid asset key');
      }

      try {
        await ctx.env.R2.delete(key);
        return { success: true };
      } catch (error) {
        throw new Error(`Failed to delete from R2: ${error}`);
      }
    }),

  listAssets: publicProcedure.query(async ({ ctx }) => {
    try {
      const list = await ctx.env.R2.list({ prefix: 'assets/' });
      return list.objects.map((obj) => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
      }));
    } catch (error) {
      throw new Error(`Failed to list assets: ${error}`);
    }
  }),

  listAssetsByPath: publicProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ input, ctx }) => {
      const { path } = input;
      
      // Ensure path starts with 'assets/'
      const prefix = path.startsWith('assets/') ? path : `assets/${path}`;
      
      try {
        const list = await ctx.env.R2.list({ prefix });
        return list.objects.map((obj) => ({
          key: obj.key,
          filename: obj.key.split('/').pop() || obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
        }));
      } catch (error) {
        throw new Error(`Failed to list assets: ${error}`);
      }
    }),
});
