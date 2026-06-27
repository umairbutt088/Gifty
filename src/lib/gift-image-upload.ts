import { File } from 'expo-file-system';

import { supabase } from '@/lib/supabase';

const BUCKET = 'gift-images';

export type GiftImageInput = {
  uri: string;
  mimeType?: string | null;
};

export function isRemoteImageUrl(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

function getExtension(uri: string, mimeType?: string | null): string {
  if (mimeType?.includes('png')) return 'png';
  if (mimeType?.includes('webp')) return 'webp';
  if (mimeType?.includes('heic')) return 'heic';
  if (mimeType?.includes('heif')) return 'heif';

  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  if (match?.[1]) return match[1].toLowerCase();

  return 'jpg';
}

function getContentType(extension: string, mimeType?: string | null): string {
  if (mimeType) return mimeType;

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    default:
      return 'image/jpeg';
  }
}

export async function uploadGiftImage(
  vendorId: string,
  localUri: string,
  mimeType?: string | null,
): Promise<{ url: string | null; error: Error | null }> {
  if (isRemoteImageUrl(localUri)) {
    return { url: localUri, error: null };
  }

  try {
    const file = new File(localUri);
    const extension = getExtension(localUri, mimeType).replace(/^\./, '') || 'jpg';
    const path = `${vendorId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const contentType = getContentType(extension, mimeType);
    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
      contentType,
      upsert: false,
    });

    if (error || !data) {
      return {
        url: null,
        error: new Error(
          error?.message.includes('Bucket not found')
            ? 'Image upload failed. Run migration 3 in Supabase (gift-images bucket).'
            : (error?.message ?? 'Could not upload image.'),
        ),
      };
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return { url: publicData.publicUrl, error: null };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error : new Error('Could not upload image.'),
    };
  }
}

export async function resolveGiftImageUrls(
  vendorId: string,
  images: GiftImageInput[],
): Promise<{ urls: string[]; error: Error | null }> {
  if (images.length === 0) {
    return { urls: [], error: null };
  }

  const urls: string[] = [];

  for (const image of images) {
    const { url, error } = await uploadGiftImage(vendorId, image.uri, image.mimeType);
    if (error || !url) {
      return { urls: [], error: error ?? new Error('Could not upload image.') };
    }
    urls.push(url);
  }

  return { urls, error: null };
}

export function getGiftImageStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;

  const path = publicUrl.slice(index + marker.length).split('?')[0];
  return path ? decodeURIComponent(path) : null;
}

export async function deleteGiftImagesFromStorage(
  imageUrls: string[],
): Promise<{ error: Error | null }> {
  const paths = imageUrls
    .map(getGiftImageStoragePath)
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) {
    return { error: null };
  }

  const { error } = await supabase.storage.from(BUCKET).remove(paths);

  return { error: error ? new Error(error.message) : null };
}
