import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export interface Projekt {
  _id: string;
  title: string;
  imageAfter: SanityImageSource & { alt?: string };
  imageBefore?: SanityImageSource & { alt?: string };
  order: number;
}

export interface Review {
  _id: string;
  text: string;
  author: string;
  location: string;
  order: number;
}

export async function getProjekti(): Promise<Projekt[]> {
  if (!import.meta.env.PUBLIC_SANITY_PROJECT_ID) return [];
  try {
    return await sanityClient.fetch(
      `*[_type == "projekt"] | order(order asc) { _id, title, imageAfter { ..., alt }, imageBefore { ..., alt }, order }`
    );
  } catch (err) {
    console.warn('[sanity] Could not fetch projekti, using fallback:', err);
    return [];
  }
}

export async function getReviews(): Promise<Review[]> {
  if (!import.meta.env.PUBLIC_SANITY_PROJECT_ID) return [];
  try {
    return await sanityClient.fetch(
      `*[_type == "review"] | order(order asc) { _id, text, author, location, order }`
    );
  } catch (err) {
    console.warn('[sanity] Could not fetch reviews, using hardcoded fallback:', err);
    return [];
  }
}
