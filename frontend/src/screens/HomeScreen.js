import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { expenseAPI } from '../services/api';

const HomeScreen = ({ navigation, onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadExpenses();
    });
    return unsubscribe;
  }, [navigation]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseAPI.getAll();
      setExpenses(data);
      setFilteredExpenses(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les dépenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    filterExpenses();
  }, [searchQuery, selectedCategory, expenses]);

  const filterExpenses = () => {
    let filtered = expenses;

    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(expense =>
        expense.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(expense =>
        expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.amount.toString().includes(searchQuery)
      );
    }

    setFilteredExpenses(filtered);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer cette dépense ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await expenseAPI.delete(id);
              loadExpenses();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la dépense');
            }
          },
        },
      ]
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      nourriture: '#FF6B6B',
      transport: '#4ECDC4',
      loisirs: '#45B7D1',
      santé: '#96CEB4',
      logement: '#FFEAA7',
      autre: '#DFE6E9',
    };
    return colors[category.toLowerCase()] || colors.autre;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderExpense = ({ item }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseContent}>
        <View style={styles.expenseHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.amount}>{item.amount.toFixed(2)} €</Text>
        </View>
        {item.description && <Text style={styles.description}>{item.description}</Text>}
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.expenseActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddExpense', { expense: item })}
        >
          <Ionicons name="create-outline" size={20} color="#667eea" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item._id)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const CATEGORIES = ['Tous', 'Nourriture', 'Transport', 'Loisirs', 'Santé', 'Logement', 'Autre'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total des dépenses</Text>
            <Text style={styles.totalAmount}>{totalExpenses.toFixed(2)} €</Text>
            <Text style={styles.expenseCount}>{filteredExpenses.length} dépense{filteredExpenses.length > 1 ? 's' : ''}</Text>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle-outline" size={32} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Stats')}
            >
              <Ionicons name="stats-chart-outline" size={32} color="#34C759" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une dépense..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryFilter,
                selectedCategory === item && styles.categoryFilterSelected,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryFilterText,
                  selectedCategory === item && styles.categoryFilterTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryFilterList}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.headerButton, styles.addButton]}
            onPress={() => navigation.navigate('AddExpense')}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text style={styles.headerButtonText}>Nouvelle dépense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, styles.feedbackButton]}
            onPress={() => navigation.navigate('Feedback')}
          >
            <Ionicons name="chatbox-outline" size={20} color="white" />
            <Text style={styles.headerButtonText}>Feedback</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredExpenses}
        renderItem={renderExpense}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadExpenses();
          }} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Chargement...' : 'Aucune dépense trouvée'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
  },
  expenseCount: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  categoryFilterList: {
    paddingVertical: 10,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryFilterSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryFilterTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    marginTop: 5,
  },
  headerButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addButton: {
    backgroundColor: '#667eea',
  },
  feedbackButton: {
    backgroundColor: '#FF9500',
  },
  headerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    padding: 15,
  },
  expenseItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseContent: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  expenseActions: {
    justifyContent: 'center',
    gap: 10,
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
});

export default HomeScreen;
