import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Send, Smile } from 'lucide-react-native';

type Message = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
};

type Props = {
  groupId: string;
  isLeader: boolean;
};

export default function GroupChatView({ groupId, isLeader }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
    updateTypingStatus(false);

    return () => {
      updateTypingStatus(false);
    };
  }, [groupId]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('group_chat_messages')
      .select(`
        *,
        profiles!group_chat_messages_user_id_fkey(display_name)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) {
      const formattedMessages = data.map((msg) => ({
        id: msg.id,
        user_id: msg.user_id,
        content: msg.content,
        created_at: msg.created_at,
        user_name: msg.profiles?.display_name || 'Anonymous',
      }));
      setMessages(formattedMessages);
    }

    const { count } = await supabase
      .from('group_members')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', groupId);

    setOnlineCount(count || 0);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`group_chat:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_chat_messages',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!user) return;

    await supabase
      .from('chat_typing_indicators')
      .upsert({
        group_id: groupId,
        user_id: user.id,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      });
  };

  const handleSendMessage = async () => {
    if (!user || !messageText.trim()) return;

    const { error } = await supabase
      .from('group_chat_messages')
      .insert({
        group_id: groupId,
        user_id: user.id,
        content: messageText.trim(),
      });

    if (!error) {
      setMessageText('');
      updateTypingStatus(false);
    }
  };

  const handleTextChange = (text: string) => {
    setMessageText(text);
    updateTypingStatus(text.length > 0);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.onlineBar}>
        <View style={styles.onlineDot} />
        <Text style={styles.onlineText}>{onlineCount} members online</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => {
          const isOwnMessage = message.user_id === user?.id;
          return (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
              ]}
            >
              {!isOwnMessage && (
                <View style={styles.messageAvatar}>
                  <Text style={styles.messageAvatarText}>
                    {message.user_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
                ]}
              >
                {!isOwnMessage && (
                  <Text style={styles.messageSender}>{message.user_name}</Text>
                )}
                <Text
                  style={[
                    styles.messageText,
                    isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                  ]}
                >
                  {message.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
                  ]}
                >
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.emojiButton}>
          <Smile size={24} color="#6B7280" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          value={messageText}
          onChangeText={handleTextChange}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Send size={20} color={messageText.trim() ? '#ffffff' : '#D1D5DB'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  onlineBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  ownMessageBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 11,
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherMessageTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  emojiButton: {
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
    minHeight: 40,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
