import { supabase } from './supabase';

export type BibleVerse = {
  chapter: number;
  verse: number;
  text: string;
};

type BibleApiResponse = {
  reference: string;
  verses: Array<{
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
};

const VERSION_MAP: Record<string, string> = {
  'NIV': 'web',
  'ESV': 'web',
  'NLT': 'web',
  'KJV': 'kjv',
  'MSG': 'web',
};

const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function fetchBibleVerses(
  reference: string,
  version: string = 'NIV'
): Promise<BibleVerse[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    const cacheKey = `${reference}:${version}`;

    if (isAuthenticated) {
      const cached = await getCachedVerses(cacheKey);
      if (cached && cached.length > 0) {
        console.log(`[BibleAPI] Using cached verses for ${reference}`);
        return cached;
      }
    } else {
      console.log(`[BibleAPI] User not authenticated, skipping cache`);
    }

    console.log(`[BibleAPI] Fetching verses for ${reference} (${version})`);

    const apiVersion = VERSION_MAP[version] || 'web';
    const encodedReference = encodeURIComponent(reference);
    const apiUrl = `https://bible-api.com/${encodedReference}?translation=${apiVersion}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`[BibleAPI] API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: BibleApiResponse = await response.json();

    if (!data.verses || data.verses.length === 0) {
      console.log(`[BibleAPI] No verses returned for ${reference}`);
      return [];
    }

    const verses: BibleVerse[] = data.verses.map(v => ({
      chapter: v.chapter,
      verse: v.verse,
      text: v.text.trim(),
    }));

    if (isAuthenticated) {
      await cacheVerses(cacheKey, verses);
    }

    console.log(`[BibleAPI] Fetched ${verses.length} verses for ${reference}`);
    return verses;
  } catch (error) {
    console.error(`[BibleAPI] Error fetching verses for ${reference}:`, error);
    return [];
  }
}

async function getCachedVerses(cacheKey: string): Promise<BibleVerse[] | null> {
  try {
    const { data, error } = await supabase
      .from('bible_verse_cache')
      .select('verses, cached_at')
      .eq('cache_key', cacheKey)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const cacheAge = Date.now() - new Date(data.cached_at).getTime();
    if (cacheAge > CACHE_DURATION_MS) {
      console.log(`[BibleAPI] Cache expired for ${cacheKey}`);
      return null;
    }

    return data.verses as BibleVerse[];
  } catch (error) {
    console.error('[BibleAPI] Error reading cache:', error);
    return null;
  }
}

async function cacheVerses(cacheKey: string, verses: BibleVerse[]): Promise<void> {
  try {
    await supabase
      .from('bible_verse_cache')
      .upsert({
        cache_key: cacheKey,
        verses: verses,
        cached_at: new Date().toISOString(),
      });

    console.log(`[BibleAPI] Cached ${verses.length} verses for ${cacheKey}`);
  } catch (error) {
    console.error('[BibleAPI] Error caching verses:', error);
  }
}

export function normalizeReference(ref: string): string {
  return ref
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(\d+)\s*-\s*(\d+)/, '$1-$2');
}

export async function fetchMultipleReferences(
  references: string[],
  version: string = 'NIV'
): Promise<BibleVerse[]> {
  const allVerses: BibleVerse[] = [];

  for (const ref of references) {
    const normalized = normalizeReference(ref);
    const verses = await fetchBibleVerses(normalized, version);
    allVerses.push(...verses);
  }

  return allVerses;
}
