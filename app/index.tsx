import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Book, Users, MessageCircle, Target, HelpCircle, HandHeart, BookOpen, Award, Shield } from 'lucide-react-native';

export default function LandingPage() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>Youth Bible In A Year</Text>
        <View style={styles.navButtons}>
          <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
            <Text style={styles.navLink}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navCta}
            onPress={() => router.push('/auth/sign-up')}
          >
            <Text style={styles.navCtaText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Grow Your Faith. Grow Together. All Year Long.</Text>
        <Text style={styles.heroSubtitle}>
          Youth Bible In A Year is a Bible-in-a-Year app created specifically for Christian teens and youth groups — combining daily Scripture, guided reflection, group discussion, prayer, and worship into one simple, safe space.
        </Text>

        <View style={styles.ctaGroup}>
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={() => router.push('/auth/sign-up')}
          >
            <Text style={styles.primaryCtaText}>👉 Start Your Year — $24.99 / year</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.highlights}>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>📖</Text>
            <Text style={styles.highlightText}>Bible in a Year — built for youth</Text>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>💬</Text>
            <Text style={styles.highlightText}>Real group conversations & live video</Text>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>🌿</Text>
            <Text style={styles.highlightText}>Gratitude, prayer, and spiritual growth tracking</Text>
          </View>
        </View>
      </View>

      {/* Who It's For Section */}
      <View style={styles.section}>
        <Text style={styles.sectionEmoji}>🤝</Text>
        <Text style={styles.sectionTitle}>Made for Christian Youth & Youth Leaders</Text>

        <View style={styles.audienceGrid}>
          <View style={styles.audienceCard}>
            <Text style={styles.audienceTitle}>For Teens:</Text>
            <View style={styles.audienceList}>
              <Text style={styles.listItem}>✓ Read the Bible in a way that makes sense</Text>
              <Text style={styles.listItem}>✓ Talk about real questions with real friends</Text>
              <Text style={styles.listItem}>✓ See God working through gratitude and answered prayer</Text>
              <Text style={styles.listItem}>✓ Track your spiritual growth all year long</Text>
            </View>
          </View>

          <View style={styles.audienceCard}>
            <Text style={styles.audienceTitle}>For Youth Leaders:</Text>
            <View style={styles.audienceList}>
              <Text style={styles.listItem}>✓ A ready-made discipleship path for the whole year</Text>
              <Text style={styles.listItem}>✓ Built-in group discussions, calls, and prayer tools</Text>
              <Text style={styles.listItem}>✓ A dashboard to see who's engaged and who needs a nudge</Text>
              <Text style={styles.listItem}>✓ Safe, moderated communication you can trust</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View style={[styles.section, styles.lightSection]}>
        <Text style={styles.sectionEmoji}>📖</Text>
        <Text style={styles.sectionTitle}>A Bible Plan Teens Can Actually Finish</Text>
        <Text style={styles.sectionIntro}>
          Most teens start Bible plans and never finish. Youth Bible In A Year guides them day by day, with:
        </Text>

        <View style={styles.checklist}>
          <Text style={styles.checklistItem}>✅ A complete Bible-in-a-Year plan</Text>
          <Text style={styles.checklistItem}>✅ Weekly themes that speak to teen life (identity, fear, purpose, forgiveness, courage, belonging)</Text>
          <Text style={styles.checklistItem}>✅ A featured passage each week</Text>
          <Text style={styles.checklistItem}>✅ 8 guided discussion questions to help them understand what they read</Text>
          <Text style={styles.checklistItem}>✅ Reflection tools that connect Scripture to real life</Text>
        </View>
      </View>

      {/* Community Section */}
      <View style={styles.section}>
        <Text style={styles.sectionEmoji}>💬</Text>
        <Text style={styles.sectionTitle}>Real Community, Not Just Content</Text>
        <Text style={styles.sectionIntro}>Faith Grows Best in Community</Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <MessageCircle size={32} color="#2563EB" style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Weekly Group Discussions</Text>
            <Text style={styles.featureText}>8 guided questions tied to Scripture, threaded replies & emoji reactions</Text>
          </View>

          <View style={styles.featureCard}>
            <Users size={32} color="#2563EB" style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Live Group Chat</Text>
            <Text style={styles.featureText}>Safe, moderated group messaging with real-time encouragement</Text>
          </View>

          <View style={styles.featureCard}>
            <Shield size={32} color="#2563EB" style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Private Leader Messaging</Text>
            <Text style={styles.featureText}>Teens can message their leader directly. No teen-to-teen private DMs</Text>
          </View>

          <View style={styles.featureCard}>
            <Book size={32} color="#2563EB" style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Live Video Calls</Text>
            <Text style={styles.featureText}>Host Bible studies, prayer nights, and Q&A with one tap</Text>
          </View>
        </View>
      </View>

      {/* Prayer Section */}
      <View style={[styles.section, styles.lightSection]}>
        <Text style={styles.sectionEmoji}>🙏</Text>
        <Text style={styles.sectionTitle}>Turn Prayer into a Faith-Building Habit</Text>
        <Text style={styles.sectionIntro}>
          Prayer shouldn't disappear into a void. Youth Bible In A Year helps students see God's faithfulness over time.
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <HandHeart size={32} color="#2563EB" style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Prayer Requests</Text>
            <Text style={styles.featureText}>Post prayers to the group or privately to leaders</Text>
          </View>

          <View style={styles.featureCard}>
            <Target size={32} color="#2563EB" style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Answered Prayer Tracking</Text>
            <Text style={styles.featureText}>Mark requests as "Answered" and look back on a whole year of God's work</Text>
          </View>
        </View>
      </View>

      {/* Pricing Section */}
      <View style={styles.pricingSection}>
        <Text style={styles.sectionEmoji}>💰</Text>
        <Text style={styles.sectionTitle}>One Simple Price for a Full Year of Discipleship</Text>

        <View style={styles.pricingCard}>
          <Text style={styles.pricingPlanName}>Youth Bible In A Year – Annual Plan</Text>
          <Text style={styles.pricingDescription}>
            Bible plan • Groups • Discussions • Chat • Video • Gratitude • Prayer • Growth Tracking
          </Text>
          <Text style={styles.priceTag}>$24.99 / year</Text>

          <View style={styles.pricingFeatures}>
            <Text style={styles.pricingFeature}>✓ Full access to all features</Text>
            <Text style={styles.pricingFeature}>✓ All updates included</Text>
            <Text style={styles.pricingFeature}>✓ No hidden fees</Text>
            <Text style={styles.pricingFeature}>✓ 30-day money-back guarantee</Text>
          </View>

          <TouchableOpacity
            style={styles.pricingCta}
            onPress={() => router.push('/auth/sign-up')}
          >
            <Text style={styles.pricingCtaText}>👉 Get Started — $24.99 / year</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Final CTA Section */}
      <View style={styles.finalCta}>
        <Text style={styles.sectionEmoji}>🔥</Text>
        <Text style={styles.sectionTitle}>Ready to Live Your Faith Out Loud?</Text>

        <Text style={styles.finalCtaText}>
          This is your year. Your chance to grow, to show up, to become who God is calling you to be. Dive into Scripture, stay connected with your friends, track the ways God shows up, and watch your faith come alive—one day at a time.
        </Text>

        <View style={styles.motivationList}>
          <Text style={styles.motivationItem}>• Make this your journey, not just another app</Text>
          <Text style={styles.motivationItem}>• Build a habit that actually changes you</Text>
          <Text style={styles.motivationItem}>• See God move in real ways</Text>
          <Text style={styles.motivationItem}>• Do it with your crew</Text>
        </View>

        <TouchableOpacity
          style={styles.finalCtaButton}
          onPress={() => router.push('/auth/sign-up')}
        >
          <Text style={styles.finalCtaButtonText}>👉 Create My Account — $24.99 / year</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>© 2025 Youth Bible In A Year. All rights reserved.</Text>
        <Text style={styles.footerTagline}>Bible-in-a-Year discipleship app for Christian Youth & Youth Leaders.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFFE',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#F8FFFE',
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  logo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLink: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  navCta: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navCtaText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  hero: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: '#F0FDFA',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 32,
  },
  ctaGroup: {
    marginBottom: 32,
  },
  primaryCta: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryCtaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  highlights: {
    gap: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightIcon: {
    fontSize: 24,
  },
  highlightText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: '#F8FFFE',
  },
  lightSection: {
    backgroundColor: '#F0FDFA',
  },
  sectionEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  sectionIntro: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  audienceGrid: {
    gap: 20,
  },
  audienceCard: {
    backgroundColor: '#F8FFFE',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  audienceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  audienceList: {
    gap: 8,
  },
  listItem: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  checklist: {
    gap: 12,
  },
  checklistItem: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  featureGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#F8FFFE',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  featureIcon: {
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  pricingSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: '#F0FDFA',
  },
  pricingCard: {
    backgroundColor: '#F8FFFE',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  pricingPlanName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  pricingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  priceTag: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 24,
    textAlign: 'center',
  },
  pricingFeatures: {
    gap: 8,
    marginBottom: 24,
  },
  pricingFeature: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  pricingCta: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  pricingCtaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  finalCta: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: '#F8FFFE',
  },
  finalCtaText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  motivationList: {
    gap: 8,
    marginBottom: 32,
  },
  motivationItem: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  finalCtaButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  finalCtaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
  },
  footerBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  footerTagline: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
