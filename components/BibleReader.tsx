import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { fetchMultiplePassages, fetchAvailableBibles, getBibleIdByAbbreviation, BibleVerse, BibleVersion } from '@/lib/bibleHelloAo';
import { Play, Pause, Settings, BookOpen, Volume2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import BibleVersionSelector from './BibleVersionSelector';
import BibleNavigator from './BibleNavigator';
import { useAuth } from '@/contexts/AuthContext';


type Props = {
  scriptureReferences: string[];
};

export default function BibleReader({ scriptureReferences }: Props) {
  const { user } = useAuth();
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('KJV');
  const [availableVersions, setAvailableVersions] = useState<BibleVersion[]>([]);
  const [showVersionSelector, setShowVersionSelector] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [currentBook, setCurrentBook] = useState('');
  const [currentChapter, setCurrentChapter] = useState(1);

  useEffect(() => {
    loadBibleVersions();
  }, []);

  useEffect(() => {
    if (availableVersions.length > 0) {
      loadUserPreferences();
    }
  }, [user, availableVersions]);

  useEffect(() => {
    if (availableVersions.length > 0) {
      loadVerses();
    }
    return () => {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } else {
        Speech.stop();
      }
    };
  }, [scriptureReferences, currentVersion, availableVersions]);

  const loadBibleVersions = async () => {
    try {
      const versions = await fetchAvailableBibles();
      if (versions.length > 0) {
        setAvailableVersions(versions);
        console.log(`[BibleReader] Loaded ${versions.length} Bible versions`);
      } else {
        console.warn('[BibleReader] No Bible versions available, using fallback');
        setAvailableVersions([{
          id: 'de4e12af7f28f599-02',
          name: 'King James Version',
          abbreviation: 'KJV',
          language: 'English',
        }]);
      }
    } catch (error) {
      console.error('[BibleReader] Error loading Bible versions:', error);
      setAvailableVersions([{
        id: 'de4e12af7f28f599-02',
        name: 'King James Version',
        abbreviation: 'KJV',
        language: 'English',
      }]);
    }
  };

  const loadUserPreferences = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_preferences')
      .select('preferred_bible_version')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data?.preferred_bible_version) {
      const { data: version } = await supabase
        .from('bible_versions')
        .select('abbreviation')
        .eq('id', data.preferred_bible_version)
        .maybeSingle();

      if (version) {
        setCurrentVersion(version.abbreviation);
      }
    }
  };

  const loadVerses = async () => {
    setLoading(true);

    try {
      console.log(`[BibleReader] Fetching verses for references:`, scriptureReferences);

      const hasPlaceholder = scriptureReferences.some(ref =>
        ref.toLowerCase().includes('scripture for day') ||
        ref.toLowerCase().includes('placeholder')
      );

      if (hasPlaceholder) {
        console.log('[BibleReader] Placeholder references detected, skipping fetch');
        setVerses([]);
        setLoading(false);
        return;
      }

      const bibleId = getBibleIdByAbbreviation(currentVersion, availableVersions);
      console.log(`[BibleReader] Using Bible ID: ${bibleId} for ${currentVersion}`);

      let verses: BibleVerse[] = [];

      try {
        verses = await fetchMultiplePassages(bibleId, scriptureReferences);
        console.log(`[BibleReader] Loaded ${verses.length} verses from API`);

        if (verses.length === 0) {
          console.warn('[BibleReader] API returned no verses, trying database fallback');
          verses = await loadVersesFromDatabase(scriptureReferences);
          console.log(`[BibleReader] Loaded ${verses.length} verses from database`);
        }
      } catch (apiError) {
        console.warn('[BibleReader] API failed, falling back to database:', apiError);

        try {
          verses = await loadVersesFromDatabase(scriptureReferences);
          console.log(`[BibleReader] Loaded ${verses.length} verses from database`);
        } catch (dbError) {
          console.error('[BibleReader] Database fallback also failed:', dbError);
          verses = [];
        }
      }

      setVerses(verses);
    } catch (error) {
      console.error('[BibleReader] Error loading verses:', error);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVersesFromDatabase = async (references: string[]): Promise<BibleVerse[]> => {
    const allVerses: BibleVerse[] = [];

    for (const ref of references) {
      try {
        console.log(`[DB] Processing reference: ${ref}`);

        const crossChapterVerseMatch = ref.match(/^([A-Za-z\s\d]+?)\s+(\d+):(\d+)\s*-\s*(\d+):(\d+)$/);
        const chapterRangeMatch = ref.match(/^([A-Za-z\s\d]+?)\s+(\d+)\s*-\s*(\d+)$/);
        const verseRangeMatch = ref.match(/^([A-Za-z\s\d]+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
        const singleChapterMatch = ref.match(/^([A-Za-z\s\d]+?)\s+(\d+)$/);

        let bookName: string;
        let startChapter: number, endChapter: number;
        let startVerse: number | undefined, endVerse: number | undefined;

        if (crossChapterVerseMatch) {
          bookName = crossChapterVerseMatch[1].trim();
          startChapter = parseInt(crossChapterVerseMatch[2]);
          endChapter = parseInt(crossChapterVerseMatch[4]);
          startVerse = parseInt(crossChapterVerseMatch[3]);
          endVerse = parseInt(crossChapterVerseMatch[5]);
          console.log(`[DB] Cross-chapter verse range: ${bookName} ${startChapter}:${startVerse} - ${endChapter}:${endVerse}`);
        } else if (chapterRangeMatch) {
          bookName = chapterRangeMatch[1].trim();
          startChapter = parseInt(chapterRangeMatch[2]);
          endChapter = parseInt(chapterRangeMatch[3]);
          console.log(`[DB] Chapter range: ${bookName} ${startChapter}-${endChapter}`);
        } else if (verseRangeMatch) {
          bookName = verseRangeMatch[1].trim();
          startChapter = endChapter = parseInt(verseRangeMatch[2]);
          startVerse = parseInt(verseRangeMatch[3]);
          endVerse = verseRangeMatch[4] ? parseInt(verseRangeMatch[4]) : startVerse;
          console.log(`[DB] Verse range: ${bookName} ${startChapter}:${startVerse}-${endVerse}`);
        } else if (singleChapterMatch) {
          bookName = singleChapterMatch[1].trim();
          startChapter = endChapter = parseInt(singleChapterMatch[2]);
          console.log(`[DB] Single chapter: ${bookName} ${startChapter}`);
        } else {
          console.warn(`[DB] Could not parse reference: ${ref}`);
          continue;
        }

        const { data: book, error: bookError } = await supabase
          .from('bible_books')
          .select('id, name')
          .ilike('name', `%${bookName}%`)
          .maybeSingle();

        if (bookError || !book) {
          console.warn(`[DB] Book not found for: ${bookName}`);
          continue;
        }

        console.log(`[DB] Found book: ${book.name} (${book.id})`);

        let query = supabase
          .from('bible_verses')
          .select('chapter, verse, text')
          .eq('book_id', book.id);

        if (startChapter === endChapter) {
          query = query.eq('chapter', startChapter);
          if (startVerse !== undefined && endVerse !== undefined) {
            query = query.gte('verse', startVerse).lte('verse', endVerse);
          } else if (startVerse !== undefined) {
            query = query.gte('verse', startVerse);
          }
        } else {
          query = query.gte('chapter', startChapter).lte('chapter', endChapter);
        }

        query = query.order('chapter').order('verse');

        const { data: verses, error: versesError } = await query;

        if (versesError) {
          console.error(`[DB] Error fetching verses:`, versesError);
          continue;
        }

        if (verses && verses.length > 0) {
          console.log(`[DB] Found ${verses.length} verses for ${ref}`);
          allVerses.push(...verses.map(v => ({
            reference: `${book.name} ${v.chapter}:${v.verse}`,
            text: v.text,
            book: book.name,
            chapter: v.chapter,
            verse: v.verse,
          })));
        } else {
          console.warn(`[DB] No verses found for ${ref}`);
        }
      } catch (error) {
        console.error(`[DB] Error processing reference ${ref}:`, error);
      }
    }

    console.log(`[DB] Total verses loaded from database: ${allVerses.length}`);
    return allVerses;
  };

  const toggleAudio = async () => {
    if (isPlaying) {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } else {
        Speech.stop();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const fullText = verses.map(v => v.text).join(' ');

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(fullText);
          utterance.lang = 'en-US';
          utterance.pitch = 1.0;
          utterance.rate = 0.9;
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
        } else {
          alert('Text-to-speech is not supported in your browser');
          setIsPlaying(false);
        }
      } else {
        Speech.speak(fullText, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
          onDone: () => setIsPlaying(false),
          onStopped: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#2563EB" />
        <Text style={styles.loadingText}>Loading Bible text...</Text>
      </View>
    );
  }

  if (verses.length === 0) {
    const hasPlaceholder = scriptureReferences.some(ref =>
      ref.toLowerCase().includes('scripture for day') ||
      ref.toLowerCase().includes('placeholder')
    );

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {hasPlaceholder
            ? 'Bible reading content is being prepared for this day. Please check back later or navigate to a different week.'
            : 'Unable to load Bible verses at this time. This may be due to:\n\n• Internet connection issues\n• The Bible API being temporarily unavailable\n• Scripture references not yet being available\n\nPlease try again in a moment or check your connection.'}
        </Text>
        <Text style={styles.referenceText}>
          References: {scriptureReferences.join(', ')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.versionBadge}>{currentVersion}</Text>
          <TouchableOpacity onPress={() => setShowVersionSelector(true)} style={styles.settingsButton}>
            <Settings size={18} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setShowNavigator(true)} style={styles.navButton}>
            <BookOpen size={18} color="#2563EB" />
            <Text style={styles.navButtonText}>Navigate</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleAudio} style={styles.audioButton}>
            {isPlaying ? (
              <>
                <Pause size={18} color="#fff" />
                <Text style={styles.audioButtonText}>Pause</Text>
              </>
            ) : (
              <>
                <Volume2 size={18} color="#fff" />
                <Text style={styles.audioButtonText}>Listen</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.versesContainer}>
        {verses.map((verse, index) => (
          <View key={index} style={styles.verseRow}>
            <Text style={styles.verseNumber}>{verse.verse}</Text>
            <Text style={styles.verseText}>{verse.text}</Text>
          </View>
        ))}
      </ScrollView>

      <BibleVersionSelector
        visible={showVersionSelector}
        onClose={() => setShowVersionSelector(false)}
        currentVersion={currentVersion}
        onSelectVersion={(version) => setCurrentVersion(version)}
        versions={availableVersions}
      />

      <BibleNavigator
        visible={showNavigator}
        onClose={() => setShowNavigator(false)}
        onNavigate={(book, chapter) => {
          setCurrentBook(book);
          setCurrentChapter(chapter);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  referenceText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 4,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  versesContainer: {
    maxHeight: 400,
    padding: 16,
  },
  verseRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    marginRight: 8,
    minWidth: 24,
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
  },
});
