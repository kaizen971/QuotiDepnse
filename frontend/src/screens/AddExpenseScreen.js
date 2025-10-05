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
import { expenseAPI } from '../services/api';

const CATEGORIES = [
  'Nourriture',
  'Transport',
  'Loisirs',
  'Santé',
  'Logement',
  'Autre',
];

const AddExpenseScreen = ({ navigation, route }) => {
  const editingExpense = route?.params?.expense;
  const [amount, setAmount] = useState(editingExpense?.amount?.toString() || '');
  const [category, setCategory] = useState(editingExpense?.category || 'Nourriture');
  const [description, setDescription] = useState(editingExpense?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount) {
      Alert.alert('Erreur', 'Veuillez entrer un montant');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    setLoading(true);
    try {
      if (editingExpense) {
        await expenseAPI.update(editingExpense._id, {
          amount: amountNum,
          category,
          description,
        });
        Alert.alert('Succès', 'Dépense modifiée avec succès', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await expenseAPI.create({
          amount: amountNum,
          category,
          description,
        });
        Alert.alert('Succès', 'Dépense ajoutée avec succès', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Erreur', editingExpense ? 'Impossible de modifier la dépense' : 'Impossible d\'ajouter la dépense');
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
        <Text style={styles.label}>Montant (€)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonSelected,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  category === cat && styles.categoryButtonTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ex: Courses chez Carrefour"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading
              ? (editingExpense ? 'Modification...' : 'Ajout...')
              : (editingExpense ? 'Modifier la dépense' : 'Ajouter la dépense')
            }
          </Text>
        </TouchableOpacity>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  categoryButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddExpenseScreen;
