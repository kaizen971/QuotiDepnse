import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { feedbackAPI } from '../services/api';

const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Bug', icon: 'bug-outline', color: '#FF3B30' },
  { id: 'feature', label: 'Suggestion', icon: 'bulb-outline', color: '#FF9500' },
  { id: 'improvement', label: 'Amélioration', icon: 'construct-outline', color: '#34C759' },
  { id: 'other', label: 'Autre', icon: 'chatbox-outline', color: '#667eea' },
];

const FeedbackScreen = ({ navigation }) => {
  const [type, setType] = useState('feature');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre message');
      return;
    }

    if (message.trim().length < 10) {
      Alert.alert('Erreur', 'Le message doit contenir au moins 10 caractères');
      return;
    }

    setLoading(true);
    try {
      await feedbackAPI.submit({ type, message: message.trim() });
      Alert.alert(
        'Merci !',
        'Votre feedback a été envoyé avec succès. Nous l\'examinerons rapidement.',
        [
          {
            text: 'OK',
            onPress: () => {
              setMessage('');
              setType('feature');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="chatbox-ellipses-outline" size={50} color="#667eea" />
          <Text style={styles.title}>Votre avis compte</Text>
          <Text style={styles.subtitle}>
            Aidez-nous à améliorer QuotiDepnse en partageant vos idées et retours
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Type de feedback</Text>
          <View style={styles.typeContainer}>
            {FEEDBACK_TYPES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.typeButton,
                  type === item.id && styles.typeButtonSelected,
                  type === item.id && { borderColor: item.color },
                ]}
                onPress={() => setType(item.id)}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={type === item.id ? item.color : '#999'}
                />
                <Text
                  style={[
                    styles.typeText,
                    type === item.id && { color: item.color, fontWeight: '600' },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Votre message</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Décrivez votre feedback en détail..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {message.length} caractère{message.length > 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Ionicons name="send-outline" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.submitButtonText}>
            {loading ? 'Envoi...' : 'Envoyer le feedback'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#34C759" />
          <Text style={styles.infoText}>
            Vos retours sont précieux et nous aident à améliorer l'application
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    gap: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  textArea: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 150,
    color: '#333',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default FeedbackScreen;
