import { supabase } from './supabase';

const BASE_URL = 'https://bible.helloao.org/api';

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
  englishName?: string;
  numberOfBooks?: number;
};

type Translation = {
  id: string;
  name: string;
  englishName: string;
  website: string;
  licenseUrl: string;
  shortName: string;
  language: string;
  languageName?: string;
  languageEnglishName?: string;
  textDirection: 'ltr' | 'rtl';
  availableFormats: ('json' | 'usfm')[];
  listOfBooksApiLink: string;
  numberOfBooks: number;
  totalNumberOfChapters: number;
  totalNumberOfVerses: number;
};

type ChapterResponse = {
  translation: {
    id: string;
    name: string;
    website: string;
    licenseUrl: string;
    shortName: string;
    language: string;
    textDirection: 'ltr' | 'rtl';
  };
  book: {
    id: string;
    name: string;
    commonName: string;
    numberOfChapters: number;
  };
  thisChapterLink: string;
  thisChapterAudioLinks: any;
  nextChapterLink?: string;
  previousChapterLink?: string;
  chapter: {
    number: number;
    content: Array<{
      type: 'verse' | 'heading' | 'line_break';
      number?: number;
      content?: string[];
    }>;
  };
  verses?: Array<{
    chapter: number;
    verse: number;
    text: string;
  }>;
};

const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function fetchAvailableBibles(): Promise<BibleVersion[]> {
  try {
    console.log('[HelloAO] Fetching available translations...');

    const cachedVersions = await getCachedVersions();
    if (cachedVersions && cachedVersions.length > 0) {
      console.log(`[HelloAO] Using cached versions (${cachedVersions.length} versions)`);
      return cachedVersions;
    }

    const response = await fetch(`${BASE_URL}/available_translations.json`);

    if (!response.ok) {
      console.error(`[HelloAO] API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: { translations: Translation[] } = await response.json();

    if (!data.translations || !Array.isArray(data.translations)) {
      console.error('[HelloAO] Invalid response format');
      return [];
    }

    const englishTranslations = data.translations
      .filter(t => t.language === 'eng' && t.numberOfBooks >= 66)
      .map(t => ({
        id: t.id,
        name: t.name,
        abbreviation: t.shortName,
        language: 'English',
        englishName: t.englishName,
        numberOfBooks: t.numberOfBooks,
      }));

    await cacheVersions(englishTranslations);
    console.log(`[HelloAO] Fetched ${englishTranslations.length} Bible versions`);
    return englishTranslations;
  } catch (error) {
    console.error('[HelloAO] Error fetching translations:', error);
    return [];
  }
}

export async function fetchPassage(
  translationId: string,
  reference: string
): Promise<BibleVerse[]> {
  try {
    console.log(`[HelloAO] Starting fetch for: ${reference} with translation: ${translationId}`);

    const cacheKey = `${translationId}:${reference}`;

    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    if (isAuthenticated) {
      const cached = await getCachedPassage(cacheKey);
      if (cached && cached.length > 0) {
        console.log(`[HelloAO] Using cached passage for ${reference} (${cached.length} verses)`);
        return cached;
      }
    }

    console.log(`[HelloAO] No cache found, fetching from API: ${reference}`);

    const parsedRef = parseReference(reference);
    if (!parsedRef) {
      console.error(`[HelloAO] Could not parse reference: ${reference}`);
      console.log(`[HelloAO] Attempting database fallback`);
      return await fetchFromDatabase(reference);
    }

    const { book, startChapter, endChapter, startVerse, endVerse } = parsedRef;
    const bookId = normalizeBookName(book);

    const allVerses: BibleVerse[] = [];

    if (endChapter && endChapter !== startChapter) {
      console.log(`[HelloAO] Fetching chapter range: ${bookId} ${startChapter}-${endChapter}`);
      for (let chapter = startChapter; chapter <= endChapter; chapter++) {
        console.log(`[HelloAO] Fetching individual chapter: ${bookId} ${chapter}`);
        const chapterVerses = await fetchChapter(translationId, bookId, chapter);
        console.log(`[HelloAO] Got ${chapterVerses.length} verses from ${bookId} ${chapter}`);

        let filteredVerses = chapterVerses;
        if (chapter === startChapter && startVerse) {
          filteredVerses = chapterVerses.filter(v => v.verse >= startVerse);
          console.log(`[HelloAO] Filtered first chapter from verse ${startVerse}, got ${filteredVerses.length} verses`);
        } else if (chapter === endChapter && endVerse) {
          filteredVerses = chapterVerses.filter(v => v.verse <= endVerse);
          console.log(`[HelloAO] Filtered last chapter to verse ${endVerse}, got ${filteredVerses.length} verses`);
        }

        allVerses.push(...filteredVerses);
      }
    } else {
      const url = `${BASE_URL}/${translationId}/${bookId}/${startChapter}.json`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[HelloAO] API error: ${response.status} ${response.statusText}`);
        return await fetchFromDatabase(reference);
      }

      const data: ChapterResponse = await response.json();

      let rawVerses: Array<{ chapter: number; verse: number; text: string }> = [];

      if (data.verses && data.verses.length > 0) {
        rawVerses = data.verses;
      } else if (data.chapter && data.chapter.content) {
        const chapterNumber = data.chapter.number;
        rawVerses = data.chapter.content
          .filter(item => item.type === 'verse' && item.number && item.content)
          .map(item => ({
            chapter: chapterNumber,
            verse: item.number!,
            text: item.content!.join(' '),
          }));
      }

      if (rawVerses.length === 0) {
        console.log(`[HelloAO] No verses returned for ${reference}`);
        return await fetchFromDatabase(reference);
      }

      let verses = rawVerses.map(v => ({
        chapter: v.chapter,
        verse: v.verse,
        text: v.text.trim(),
      }));

      if (startVerse && endVerse) {
        verses = verses.filter(v => v.verse >= startVerse && v.verse <= endVerse);
      } else if (startVerse) {
        verses = verses.filter(v => v.verse >= startVerse);
      }

      allVerses.push(...verses);
    }

    if (isAuthenticated && allVerses.length > 0) {
      await cachePassage(cacheKey, allVerses);
    }

    console.log(`[HelloAO] Fetched ${allVerses.length} verses for ${reference}`);
    return allVerses;
  } catch (error) {
    console.error(`[HelloAO] Error fetching passage ${reference}:`, error);
    return await fetchFromDatabase(reference);
  }
}

async function fetchChapter(
  translationId: string,
  bookId: string,
  chapter: number
): Promise<BibleVerse[]> {
  try {
    const url = `${BASE_URL}/${translationId}/${bookId}/${chapter}.json`;
    console.log(`[HelloAO] Calling API: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[HelloAO] Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: ChapterResponse = await response.json();

    let rawVerses: Array<{ chapter: number; verse: number; text: string }> = [];

    if (data.verses && data.verses.length > 0) {
      rawVerses = data.verses;
    } else if (data.chapter && data.chapter.content) {
      const chapterNumber = data.chapter.number;
      rawVerses = data.chapter.content
        .filter(item => item.type === 'verse' && item.number && item.content)
        .map(item => ({
          chapter: chapterNumber,
          verse: item.number!,
          text: item.content!.join(' '),
        }));
    }

    if (rawVerses.length === 0) {
      return [];
    }

    return rawVerses.map(v => ({
      chapter: v.chapter,
      verse: v.verse,
      text: v.text.trim(),
    }));
  } catch (error) {
    console.error(`[HelloAO] Error fetching chapter ${bookId} ${chapter}:`, error);
    return [];
  }
}

function parseReference(reference: string): {
  book: string;
  startChapter: number;
  endChapter?: number;
  startVerse?: number;
  endVerse?: number;
} | null {
  const crossChapterVerseMatch = reference.match(/^([A-Za-z\s\d]+?)\s+(\d+):(\d+)\s*-\s*(\d+):(\d+)$/);
  if (crossChapterVerseMatch) {
    return {
      book: crossChapterVerseMatch[1].trim(),
      startChapter: parseInt(crossChapterVerseMatch[2]),
      endChapter: parseInt(crossChapterVerseMatch[4]),
      startVerse: parseInt(crossChapterVerseMatch[3]),
      endVerse: parseInt(crossChapterVerseMatch[5]),
    };
  }

  const chapterRangeMatch = reference.match(/^([A-Za-z\s\d]+?)\s+(\d+)\s*-\s*(\d+)$/);
  if (chapterRangeMatch) {
    return {
      book: chapterRangeMatch[1].trim(),
      startChapter: parseInt(chapterRangeMatch[2]),
      endChapter: parseInt(chapterRangeMatch[3]),
    };
  }

  const verseRangeMatch = reference.match(/^([A-Za-z\s\d]+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (verseRangeMatch) {
    return {
      book: verseRangeMatch[1].trim(),
      startChapter: parseInt(verseRangeMatch[2]),
      startVerse: parseInt(verseRangeMatch[3]),
      endVerse: verseRangeMatch[4] ? parseInt(verseRangeMatch[4]) : undefined,
    };
  }

  const singleChapterMatch = reference.match(/^([A-Za-z\s\d]+?)\s+(\d+)$/);
  if (singleChapterMatch) {
    return {
      book: singleChapterMatch[1].trim(),
      startChapter: parseInt(singleChapterMatch[2]),
    };
  }

  return null;
}

function normalizeBookName(bookName: string): string {
  const bookMap: Record<string, string> = {
    'genesis': 'GEN',
    'exodus': 'EXO',
    'leviticus': 'LEV',
    'numbers': 'NUM',
    'deuteronomy': 'DEU',
    'joshua': 'JOS',
    'judges': 'JDG',
    'ruth': 'RUT',
    '1 samuel': '1SA',
    '2 samuel': '2SA',
    '1 kings': '1KI',
    '2 kings': '2KI',
    '1 chronicles': '1CH',
    '2 chronicles': '2CH',
    'ezra': 'EZR',
    'nehemiah': 'NEH',
    'esther': 'EST',
    'job': 'JOB',
    'psalm': 'PSA',
    'psalms': 'PSA',
    'proverbs': 'PRO',
    'ecclesiastes': 'ECC',
    'song of solomon': 'SNG',
    'isaiah': 'ISA',
    'jeremiah': 'JER',
    'lamentations': 'LAM',
    'ezekiel': 'EZK',
    'daniel': 'DAN',
    'hosea': 'HOS',
    'joel': 'JOL',
    'amos': 'AMO',
    'obadiah': 'OBA',
    'jonah': 'JON',
    'micah': 'MIC',
    'nahum': 'NAM',
    'habakkuk': 'HAB',
    'zephaniah': 'ZEP',
    'haggai': 'HAG',
    'zechariah': 'ZEC',
    'malachi': 'MAL',
    'matthew': 'MAT',
    'mark': 'MRK',
    'luke': 'LUK',
    'john': 'JHN',
    'acts': 'ACT',
    'romans': 'ROM',
    '1 corinthians': '1CO',
    '2 corinthians': '2CO',
    'galatians': 'GAL',
    'ephesians': 'EPH',
    'philippians': 'PHP',
    'colossians': 'COL',
    '1 thessalonians': '1TH',
    '2 thessalonians': '2TH',
    '1 timothy': '1TI',
    '2 timothy': '2TI',
    'titus': 'TIT',
    'philemon': 'PHM',
    'hebrews': 'HEB',
    'james': 'JAS',
    '1 peter': '1PE',
    '2 peter': '2PE',
    '1 john': '1JN',
    '2 john': '2JN',
    '3 john': '3JN',
    'jude': 'JUD',
    'revelation': 'REV',
  };

  const normalized = bookName.toLowerCase().trim();
  return bookMap[normalized] || bookName.toUpperCase().substring(0, 3);
}

async function fetchFromDatabase(reference: string): Promise<BibleVerse[]> {
  try {
    console.log(`[Database] Attempting to fetch ${reference}`);

    const parsedRef = parseReference(reference);
    if (!parsedRef) {
      return [];
    }

    const { book, startChapter, endChapter, startVerse, endVerse } = parsedRef;

    const { data: bookData } = await supabase
      .from('bible_books')
      .select('id')
      .ilike('name', book)
      .maybeSingle();

    if (!bookData) {
      return [];
    }

    let query = supabase
      .from('bible_verses')
      .select('chapter, verse, text')
      .eq('book_id', bookData.id);

    if (endChapter) {
      query = query.gte('chapter', startChapter).lte('chapter', endChapter);
    } else {
      query = query.eq('chapter', startChapter);

      if (startVerse && endVerse) {
        query = query.gte('verse', startVerse).lte('verse', endVerse);
      } else if (startVerse) {
        query = query.gte('verse', startVerse);
      }
    }

    query = query.order('chapter').order('verse');

    const { data: verses } = await query;

    return verses || [];
  } catch (error) {
    console.error(`[Database] Error:`, error);
    return [];
  }
}

export async function fetchMultiplePassages(
  translationId: string,
  references: string[]
): Promise<BibleVerse[]> {
  const allVerses: BibleVerse[] = [];

  for (const ref of references) {
    const verses = await fetchPassage(translationId, ref.trim());
    allVerses.push(...verses);
  }

  return allVerses;
}

async function getCachedVersions(): Promise<BibleVersion[] | null> {
  try {
    const { data, error } = await supabase
      .from('bible_verse_cache')
      .select('verses, cached_at')
      .eq('cache_key', 'bible_versions_helloao')
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
    console.error('[HelloAO] Error reading version cache:', error);
    return null;
  }
}

async function cacheVersions(versions: BibleVersion[]): Promise<void> {
  try {
    await supabase
      .from('bible_verse_cache')
      .upsert({
        cache_key: 'bible_versions_helloao',
        verses: versions as any,
        cached_at: new Date().toISOString(),
      });

    console.log(`[HelloAO] Cached ${versions.length} Bible versions`);
  } catch (error) {
    console.error('[HelloAO] Error caching versions:', error);
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
    console.error('[HelloAO] Error reading passage cache:', error);
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

    console.log(`[HelloAO] Cached ${verses.length} verses`);
  } catch (error) {
    console.error('[HelloAO] Error caching passage:', error);
  }
}

export function getBibleIdByAbbreviation(abbreviation: string, versions: BibleVersion[]): string {
  const version = versions.find(v =>
    v.abbreviation.toUpperCase() === abbreviation.toUpperCase()
  );
  return version?.id || versions[0]?.id || 'KJV';
}
