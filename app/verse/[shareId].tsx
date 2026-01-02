import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { BookOpen, Download, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type SharedVerse = {
  id: string;
  share_id: string;
  verse_reference: string;
  verse_text: string;
  week_number: number;
  day_number: number;
};

export default function SharedVersePage() {
  const { shareId } = useLocalSearchParams();
  const [verse, setVerse] = useState<SharedVerse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSharedVerse();
  }, [shareId]);

  const loadSharedVerse = async () => {
    if (!shareId) return;

    try {
      const { data, error } = await supabase
        .from('shared_verses')
        .select('*')
        .eq('share_id', shareId)
        .single();

      if (error) throw error;

      if (data) {
        setVerse(data);

        await supabase.rpc('track_share_view', {
          p_share_id: shareId as string,
          p_referrer: document.referrer || null,
          p_user_agent: navigator.userAgent || null,
        });
      }
    } catch (error) {
      console.error('Error loading shared verse:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadApp = async (platform: 'ios' | 'android' | 'web') => {
    if (shareId) {
      await supabase.rpc('track_share_install', {
        p_share_id: shareId as string,
      });
    }

    const urls = {
      ios: 'https://apps.apple.com/app/your-app',
      android: 'https://play.google.com/store/apps/details?id=your.app',
      web: window.location.origin,
    };

    Linking.openURL(urls[platform]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!verse) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <BookOpen size={48} color="#d1d5db" />
          <Text style={styles.errorTitle}>Verse Not Found</Text>
          <Text style={styles.errorText}>
            This shared verse link is invalid or has expired.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <BookOpen size={32} color="#6366f1" strokeWidth={2.5} />
        </View>
        <Text style={styles.appName}>Bible in a Year</Text>
        <Text style={styles.tagline}>Read Through the Bible Together</Text>
      </View>

      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#a855f7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.verseCard}
      >
        {verse.week_number && (
          <View style={styles.weekBadge}>
            <Text style={styles.weekBadgeText}>
              Week {verse.week_number} • Day {verse.day_number}
            </Text>
          </View>
        )}

        <Text style={styles.verseText}>{verse.verse_text}</Text>

        <View style={styles.referenceContainer}>
          <View style={styles.referenceLine} />
          <Text style={styles.reference}>{verse.verse_reference}</Text>
          <View style={styles.referenceLine} />
        </View>
      </LinearGradient>

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Join Thousands Reading the Bible This Year</Text>
        <Text style={styles.ctaDescription}>
          Follow a structured reading plan, connect with youth groups, and grow in your faith journey.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📖</Text>
            <Text style={styles.featureText}>Daily Bible readings</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureText}>Youth group discussions</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Track your progress</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⭐</Text>
            <Text style={styles.featureText}>Earn badges & streaks</Text>
          </View>
        </View>

        <View style={styles.downloadButtons}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => handleDownloadApp('web')}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.downloadButtonGradient}
            >
              <Download size={20} color="#ffffff" />
              <Text style={styles.downloadButtonText}>Get Started</Text>
              <ArrowRight size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>

          {Platform.OS !== 'web' && (
            <>
              <TouchableOpacity
                style={styles.platformButton}
                onPress={() => handleDownloadApp('ios')}
              >
                <Text style={styles.platformButtonText}>📱 Download for iPhone</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.platformButton}
                onPress={() => handleDownloadApp('android')}
              >
                <Text style={styles.platformButtonText}>🤖 Download for Android</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with Bible in a Year • Share God's Word
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 15,
    color: '#666',
  },
  verseCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  weekBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  weekBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 30,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 20,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  referenceLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  reference: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  ctaSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  features: {
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  downloadButtons: {
    gap: 12,
  },
  downloadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  downloadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  platformButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  platformButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
});
