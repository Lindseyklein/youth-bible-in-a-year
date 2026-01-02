import { supabase } from './supabase';

export type BibleVerse = {
  chapter: number;
  verse: number;
  text: string;
};

export type BibleVersion = {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  source?: 'esv' | 'rkeplin' | 'api.bible' | 'bible-api' | 'database';
};

type ApiSource = 'esv' | 'rkeplin' | 'api.bible' | 'bible-api' | 'database';

const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const ESV_API_KEY = process.env.EXPO_PUBLIC_ESV_API_KEY || '';
const API_BIBLE_KEY = process.env.EXPO_PUBLIC_API_BIBLE_KEY || '';

const RKEPLIN_BASE_URL = 'https://bible-go-api.rkeplin.com/v1';
const ESV_BASE_URL = 'https://api.esv.org/v3';
const API_BIBLE_BASE_URL = 'https://rest.api.bible/v1';
const BIBLE_API_BASE_URL = 'https://bible-api.com';

const VERSION_CONFIG: Record<string, { source: ApiSource; apiId?: string }> = {
  'ESV': { source: 'esv' },
  'NIV': { source: 'rkeplin' },
  'NLT': { source: 'rkeplin' },
  'KJV': { source: 'rkeplin', apiId: 'de4e12af7f28f599-02' },
  'ASV': { source: 'rkeplin', apiId: '592420522e16049f-01' },
  'WEB': { source: 'rkeplin', apiId: '06125adad2d5898a-01' },
  'BSB': { source: 'api.bible', apiId: '01b29f4b342acc35-01' },
};

export async function fetchAvailableBibles(): Promise<BibleVersion[]> {
  try {
    const cachedVersions = await getCachedVersions();
    if (cachedVersions && cachedVersions.length > 0) {
      console.log(`[BibleAPI] Using cached versions (${cachedVersions.length} versions)`);
      return cachedVersions;
    }

    const versions: BibleVersion[] = [
      { id: 'ESV', name: 'English Standard Version', abbreviation: 'ESV', language: 'English', source: 'esv' },
      { id: 'NIV', name: 'New International Version', abbreviation: 'NIV', language: 'English', source: 'rkeplin' },
      { id: 'NLT', name: 'New Living Translation', abbreviation: 'NLT', language: 'English', source: 'rkeplin' },
      { id: 'KJV', name: 'King James Version', abbreviation: 'KJV', language: 'English', source: 'rkeplin' },
      { id: 'ASV', name: 'American Standard Version', abbreviation: 'ASV', language: 'English', source: 'rkeplin' },
      { id: 'WEB', name: 'World English Bible', abbreviation: 'WEB', language: 'English', source: 'rkeplin' },
    ];

    await cacheVersions(versions);
    return versions;
  } catch (error) {
    console.error('[BibleAPI] Error fetching Bibles:', error);
    return [];
  }
}

export async function fetchPassage(
  versionId: string,
  reference: string
): Promise<BibleVerse[]> {
  const cacheKey = `${versionId}:${reference}`;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    if (isAuthenticated) {
      const cached = await getCachedPassage(cacheKey);
      if (cached && cached.length > 0) {
        console.log(`[BibleAPI] Using cached passage for ${reference}`);
        return cached;
      }
    }

    const config = VERSION_CONFIG[versionId] || { source: 'rkeplin' };
    let verses: BibleVerse[] = [];

    console.log(`[BibleAPI] Fetching ${reference} (${versionId}) from ${config.source}`);

    if (config.source === 'esv') {
      verses = await fetchFromESV(reference);
    } else if (config.source === 'rkeplin') {
      verses = await fetchFromRKeplin(reference, versionId);
    } else if (config.source === 'api.bible' && config.apiId) {
      verses = await fetchFromApiBible(config.apiId, reference);
    }

    if (verses.length === 0) {
      console.log(`[BibleAPI] Primary source failed, trying fallback chain`);
      verses = await fetchWithFallback(reference, versionId);
    }

    if (isAuthenticated && verses.length > 0) {
      await cachePassage(cacheKey, verses);
    }

    return verses;
  } catch (error) {
    console.error(`[BibleAPI] Error fetching passage ${reference}:`, error);
    return await fetchFromDatabase(reference);
  }
}

async function fetchFromESV(reference: string): Promise<BibleVerse[]> {
  if (!ESV_API_KEY) {
    console.log('[ESV] API key not configured');
    throw new Error('ESV API key missing');
  }

  try {
    const encodedRef = encodeURIComponent(reference);
    const url = `${ESV_BASE_URL}/passage/text/?q=${encodedRef}&include-headings=false&include-footnotes=false&include-verse-numbers=true&include-short-copyright=false&include-passage-references=false`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${ESV_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`[ESV] API error: ${response.status}`);
      throw new Error(`ESV API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.passages || data.passages.length === 0) {
      return [];
    }

    return parseESVPassage(data.passages[0], reference);
  } catch (error) {
    console.error('[ESV] Error:', error);
    throw error;
  }
}

async function fetchFromRKeplin(reference: string, version: string): Promise<BibleVerse[]> {
  try {
    const parsedRef = parseReference(reference);
    if (!parsedRef) {
      throw new Error(`Invalid reference: ${reference}`);
    }

    const { book, startChapter, startVerse, endVerse } = parsedRef;

    const booksResponse = await fetch(`${RKEPLIN_BASE_URL}/books`);
    if (!booksResponse.ok) throw new Error('Failed to fetch books');

    const booksData = await booksResponse.json();
    const bookData = booksData.find((b: any) =>
      b.name.toLowerCase() === book.toLowerCase() ||
      b.abbreviation?.toLowerCase() === book.toLowerCase()
    );

    if (!bookData) {
      throw new Error(`Book not found: ${book}`);
    }

    const chapterUrl = `${RKEPLIN_BASE_URL}/books/${bookData.id}/chapters/${startChapter}?translation=${version}`;
    const chapterResponse = await fetch(chapterUrl);

    if (!chapterResponse.ok) {
      throw new Error(`Failed to fetch chapter: ${chapterResponse.status}`);
    }

    const chapterData = await chapterResponse.json();

    if (!chapterData.verses) {
      return [];
    }

    let verses = chapterData.verses.map((v: any) => ({
      chapter: startChapter,
      verse: v.verse,
      text: v.text.trim(),
    }));

    if (startVerse && endVerse) {
      verses = verses.filter((v: BibleVerse) => v.verse >= startVerse && v.verse <= endVerse);
    } else if (startVerse) {
      verses = verses.filter((v: BibleVerse) => v.verse >= startVerse);
    }

    return verses;
  } catch (error) {
    console.error('[RKeplin] Error:', error);
    throw error;
  }
}

async function fetchFromApiBible(bibleId: string, reference: string): Promise<BibleVerse[]> {
  if (!API_BIBLE_KEY) {
    throw new Error('API.Bible key missing');
  }

  try {
    const encodedReference = encodeURIComponent(reference);
    const url = `${API_BIBLE_BASE_URL}/bibles/${bibleId}/passages/${encodedReference}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`;

    const response = await fetch(url, {
      headers: {
        'api-key': API_BIBLE_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API.Bible error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !data.data.content) {
      return [];
    }

    return parsePassageContent(data.data.content, reference);
  } catch (error) {
    console.error('[API.Bible] Error:', error);
    throw error;
  }
}

async function fetchFromBibleApiCom(reference: string, version: string): Promise<BibleVerse[]> {
  try {
    const versionMap: Record<string, string> = {
      'NIV': 'web',
      'ESV': 'web',
      'NLT': 'web',
      'KJV': 'kjv',
      'ASV': 'web',
      'WEB': 'web',
    };

    const apiVersion = versionMap[version] || 'web';
    const encodedReference = encodeURIComponent(reference);
    const url = `${BIBLE_API_BASE_URL}/${encodedReference}?translation=${apiVersion}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`bible-api.com error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.verses || data.verses.length === 0) {
      return [];
    }

    return data.verses.map((v: any) => ({
      chapter: v.chapter,
      verse: v.verse,
      text: v.text.trim(),
    }));
  } catch (error) {
    console.error('[bible-api.com] Error:', error);
    throw error;
  }
}

async function fetchWithFallback(reference: string, version: string): Promise<BibleVerse[]> {
  const fallbackChain: Array<() => Promise<BibleVerse[]>> = [];

  if (version === 'ESV' && ESV_API_KEY) {
    fallbackChain.push(() => fetchFromESV(reference));
  }

  fallbackChain.push(() => fetchFromRKeplin(reference, version));

  const config = VERSION_CONFIG[version];
  if (config?.apiId && API_BIBLE_KEY) {
    fallbackChain.push(() => fetchFromApiBible(config.apiId!, reference));
  }

  fallbackChain.push(() => fetchFromBibleApiCom(reference, version));
  fallbackChain.push(() => fetchFromDatabase(reference));

  for (const fetchFn of fallbackChain) {
    try {
      const verses = await fetchFn();
      if (verses.length > 0) {
        return verses;
      }
    } catch (error) {
      continue;
    }
  }

  return [];
}

async function fetchFromDatabase(reference: string): Promise<BibleVerse[]> {
  try {
    console.log(`[Database] Attempting to fetch ${reference}`);

    const refParts = reference.match(/^([A-Za-z\s]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
    if (!refParts) {
      return [];
    }

    const bookName = refParts[1].trim();
    const startChapter = parseInt(refParts[2]);
    const startVerse = refParts[3] ? parseInt(refParts[3]) : null;
    const endVerse = refParts[4] ? parseInt(refParts[4]) : null;

    const { data: book } = await supabase
      .from('bible_books')
      .select('id')
      .ilike('name', bookName)
      .maybeSingle();

    if (!book) {
      return [];
    }

    let query = supabase
      .from('bible_verses')
      .select('chapter, verse, text')
      .eq('book_id', book.id)
      .eq('chapter', startChapter);

    if (startVerse && endVerse) {
      query = query.gte('verse', startVerse).lte('verse', endVerse);
    } else if (startVerse) {
      query = query.gte('verse', startVerse);
    }

    query = query.order('verse');

    const { data: verses } = await query;

    return verses || [];
  } catch (error) {
    console.error(`[Database] Error:`, error);
    return [];
  }
}

function parseReference(reference: string): {
  book: string;
  startChapter: number;
  startVerse?: number;
  endVerse?: number;
} | null {
  const match = reference.match(/^([A-Za-z\s]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) return null;

  return {
    book: match[1].trim(),
    startChapter: parseInt(match[2]),
    startVerse: match[3] ? parseInt(match[3]) : undefined,
    endVerse: match[4] ? parseInt(match[4]) : undefined,
  };
}

function parseESVPassage(passage: string, reference: string): BibleVerse[] {
  const verses: BibleVerse[] = [];
  const lines = passage.split('\n').filter(line => line.trim());

  const refMatch = reference.match(/(\d+):?(\d+)?/);
  let currentChapter = refMatch ? parseInt(refMatch[1]) : 1;
  let currentVerse = refMatch && refMatch[2] ? parseInt(refMatch[2]) : 1;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const verseMatch = trimmedLine.match(/^\[(\d+)\]\s*(.+)$/);
    if (verseMatch) {
      currentVerse = parseInt(verseMatch[1]);
      verses.push({
        chapter: currentChapter,
        verse: currentVerse,
        text: verseMatch[2].trim(),
      });
    } else {
      if (verses.length > 0) {
        verses[verses.length - 1].text += ' ' + trimmedLine;
      } else {
        verses.push({
          chapter: currentChapter,
          verse: currentVerse,
          text: trimmedLine,
        });
        currentVerse++;
      }
    }
  }

  return verses;
}

function parsePassageContent(content: string, reference: string): BibleVerse[] {
  const verses: BibleVerse[] = [];
  const lines = content.split('\n').filter(line => line.trim());

  const refMatch = reference.match(/(\d+):?(\d+)?/);
  let currentChapter = refMatch ? parseInt(refMatch[1]) : 1;
  let currentVerse = refMatch && refMatch[2] ? parseInt(refMatch[2]) : 1;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const verseMatch = trimmedLine.match(/^\[(\d+)\]\s*(.+)$/);
    if (verseMatch) {
      currentVerse = parseInt(verseMatch[1]);
      verses.push({
        chapter: currentChapter,
        verse: currentVerse,
        text: verseMatch[2].trim(),
      });
    } else {
      if (verses.length > 0) {
        verses[verses.length - 1].text += ' ' + trimmedLine;
      } else {
        verses.push({
          chapter: currentChapter,
          verse: currentVerse,
          text: trimmedLine,
        });
        currentVerse++;
      }
    }
  }

  return verses;
}

export async function fetchMultiplePassages(
  versionId: string,
  references: string[]
): Promise<BibleVerse[]> {
  const allVerses: BibleVerse[] = [];

  for (const ref of references) {
    const verses = await fetchPassage(versionId, ref.trim());
    allVerses.push(...verses);
  }

  return allVerses;
}

async function getCachedVersions(): Promise<BibleVersion[] | null> {
  try {
    const { data, error } = await supabase
      .from('bible_verse_cache')
      .select('verses, cached_at')
      .eq('cache_key', 'bible_versions_unified')
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const cacheAge = Date.now() - new Date(data.cached_at).getTime();
    if (cacheAge > CACHE_DURATION_MS) {
      return null;
    }

    return data.verses as BibleVersion[];
  } catch (error) {
    console.error('[BibleAPI] Error reading version cache:', error);
    return null;
  }
}

async function cacheVersions(versions: BibleVersion[]): Promise<void> {
  try {
    await supabase
      .from('bible_verse_cache')
      .upsert({
        cache_key: 'bible_versions_unified',
        verses: versions as any,
        cached_at: new Date().toISOString(),
      });

    console.log(`[BibleAPI] Cached ${versions.length} Bible versions`);
  } catch (error) {
    console.error('[BibleAPI] Error caching versions:', error);
  }
}

async function getCachedPassage(cacheKey: string): Promise<BibleVerse[] | null> {
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
      return null;
    }

    return data.verses as BibleVerse[];
  } catch (error) {
    console.error('[BibleAPI] Error reading passage cache:', error);
    return null;
  }
}

async function cachePassage(cacheKey: string, verses: BibleVerse[]): Promise<void> {
  try {
    await supabase
      .from('bible_verse_cache')
      .upsert({
        cache_key: cacheKey,
        verses: verses as any,
        cached_at: new Date().toISOString(),
      });

    console.log(`[BibleAPI] Cached ${verses.length} verses`);
  } catch (error) {
    console.error('[BibleAPI] Error caching passage:', error);
  }
}

export function getBibleIdByAbbreviation(abbreviation: string, versions: BibleVersion[]): string {
  const version = versions.find(v =>
    v.abbreviation.toUpperCase() === abbreviation.toUpperCase()
  );
  return version?.id || versions[0]?.id || 'KJV';
}
