import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConsentPage() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy & Consent Information</Text>
          <Text style={styles.subtitle}>Bible in a Year Youth App</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parental Consent for Minors</Text>
          <Text style={styles.text}>
            For users under 18 years of age, we require parental consent before they can use the Bible in a Year app.
            This is in compliance with COPPA (Children's Online Privacy Protection Act) and ensures that parents are
            aware of and approve their child's participation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Information We Collect</Text>
          <Text style={styles.text}>For youth users, we collect minimal information necessary for the app to function:</Text>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>Email address and display name</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>Bible reading progress and reflections</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>Group participation and discussions (if they join a group)</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>Prayer requests and gratitude entries (optional)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use This Information</Text>
          <Text style={styles.text}>The information collected is used solely to:</Text>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>Provide personalized Bible reading plans</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>Track reading progress throughout the year</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>Enable group study and discussions with youth leaders</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>Send optional reminders and encouragement</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Protection & Security</Text>
          <Text style={styles.text}>
            We take data security seriously. All user data is encrypted and stored securely. We never share, sell,
            or distribute personal information to third parties. Access to youth group data is restricted to
            verified youth leaders only.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parental Rights</Text>
          <Text style={styles.text}>As a parent or guardian, you have the right to:</Text>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>Review your child's personal information</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>Request deletion of your child's data</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>Revoke consent at any time</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>Prevent further collection or use of your child's information</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Youth Group Leaders</Text>
          <Text style={styles.text}>
            Youth leaders must be verified adults (18+) and can only access data for youth who have joined their
            specific groups. Leaders can view reading progress and group discussions but cannot access private
            reflections or personal information beyond what is shared in the group.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.text}>
            If you have questions about our privacy practices, parental consent, or wish to exercise your rights,
            please contact us at:
          </Text>
          <Text style={styles.contactText}>info@youthbibleinayear.com</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.effectiveDate}>Effective Date: January 1, 2026</Text>
          <Text style={styles.effectiveDate}>Last Updated: January 1, 2026</Text>
        </View>

        <View style={styles.footer}>
          <Link href="/" style={styles.link}>
            <Text style={styles.linkText}>Return to Home</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    marginLeft: 16,
    marginTop: 8,
  },
  bullet: {
    fontSize: 15,
    color: '#2563EB',
    marginRight: 8,
    fontWeight: 'bold',
  },
  contactText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 8,
  },
  effectiveDate: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  linkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
