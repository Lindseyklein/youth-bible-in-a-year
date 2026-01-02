import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, displayName: string, userRole: string, birthdate: string, parentEmail?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })();
    });
  }, []);

  const signUp = async (email: string, password: string, username: string, displayName: string, userRole: string, birthdate: string, parentEmail?: string) => {
    const calculateAge = (birthdateStr: string): number => {
      const parts = birthdateStr.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const birthDate = new Date(year, month, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const age = calculateAge(birthdate);
    const requiresParentalConsent = age >= 13 && age < 18;
    const ageGroup = age >= 18 ? 'adult' : 'teen';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName,
        },
      },
    });

    if (error) return { error };

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').update({
        username,
        display_name: displayName,
        user_role: userRole,
        age_group: ageGroup,
        birthdate,
        age_verified: true,
        requires_parental_consent: requiresParentalConsent,
        parental_consent_obtained: false,
        privacy_policy_accepted: true,
        privacy_policy_accepted_at: new Date().toISOString(),
      }).eq('id', data.user.id);

      if (profileError) return { error: profileError };

      if (requiresParentalConsent && parentEmail) {
        const consentToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const { error: consentError } = await supabase.from('parental_consents').insert({
          user_id: data.user.id,
          parent_email: parentEmail,
          consent_token: consentToken,
          consent_status: 'pending',
          expires_at: expiresAt.toISOString(),
        });

        if (consentError) return { error: consentError };

        try {
          const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
          const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

          console.log('Sending parental consent email to:', parentEmail);
          console.log('Using Supabase URL:', supabaseUrl);

          const response = await fetch(`${supabaseUrl}/functions/v1/send-parental-consent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${anonKey}`,
            },
            body: JSON.stringify({
              parentEmail,
              userEmail: email,
              displayName,
              consentToken,
            }),
          });

          const responseData = await response.json();
          console.log('Email function response:', responseData);

          if (!response.ok) {
            console.error('Failed to send parental consent email:', response.status, responseData);
          } else {
            console.log('Parental consent email sent successfully');
          }
        } catch (err) {
          console.error('Failed to send parental consent email:', err);
        }
      }

      const { data: invites } = await supabase
        .from('user_invites')
        .select('*')
        .eq('invitee_email', email)
        .eq('status', 'pending');

      if (invites && invites.length > 0) {
        await supabase
          .from('user_invites')
          .update({ status: 'accepted' })
          .eq('invitee_email', email)
          .eq('status', 'pending');
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
