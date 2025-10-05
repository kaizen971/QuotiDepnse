import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { expenseAPI } from '../services/api';

const StatsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('pie');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await expenseAPI.getStats();
      setStats(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!stats || stats.count === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Aucune donnée disponible</Text>
      </View>
    );
  }

  const pieChartData = Object.entries(stats.byCategory).map(([category, amount]) => ({
    name: category,
    amount: amount,
    color: getCategoryColor(category),
    legendFontColor: '#333',
    legendFontSize: 14,
  }));

  const barChartData = {
    labels: Object.keys(stats.byCategory).map(cat => cat.substring(0, 8)),
    datasets: [
      {
        data: Object.values(stats.byCategory),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e9ecef',
      strokeWidth: 1,
    },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.totalCard}>
          <Ionicons name="wallet" size={40} color="#667eea" />
          <Text style={styles.totalLabel}>Total général</Text>
          <Text style={styles.totalAmount}>{stats.total.toFixed(2)} €</Text>
          <Text style={styles.countText}>{stats.count} dépense{stats.count > 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Répartition par catégorie</Text>
          <View style={styles.chartToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, chartType === 'pie' && styles.toggleButtonActive]}
              onPress={() => setChartType('pie')}
            >
              <Ionicons name="pie-chart-outline" size={20} color={chartType === 'pie' ? 'white' : '#667eea'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, chartType === 'bar' && styles.toggleButtonActive]}
              onPress={() => setChartType('bar')}
            >
              <Ionicons name="bar-chart-outline" size={20} color={chartType === 'bar' ? 'white' : '#667eea'} />
            </TouchableOpacity>
          </View>
        </View>

        {pieChartData.length > 0 && (
          <View style={styles.chartContainer}>
            {chartType === 'pie' ? (
              <PieChart
                data={pieChartData}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            ) : (
              <BarChart
                data={barChartData}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={chartConfig}
                style={styles.barChart}
                verticalLabelRotation={30}
                showValuesOnTopOfBars
                fromZero
              />
            )}
          </View>
        )}

        <View style={styles.categoryList}>
          {Object.entries(stats.byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([category, amount]) => {
              const percentage = ((amount / stats.total) * 100).toFixed(1);
              return (
                <View key={category} style={styles.categoryItem}>
                  <View style={styles.categoryItemLeft}>
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: getCategoryColor(category) },
                      ]}
                    />
                    <Text style={styles.categoryName}>{category}</Text>
                  </View>
                  <View style={styles.categoryItemRight}>
                    <Text style={styles.categoryAmount}>{amount.toFixed(2)} €</Text>
                    <Text style={styles.categoryPercentage}>{percentage}%</Text>
                  </View>
                </View>
              );
            })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  totalCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#667eea',
  },
  countText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chartToggle: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 3,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#667eea',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  barChart: {
    borderRadius: 15,
  },
  categoryList: {
    marginTop: 30,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  categoryItemRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default StatsScreen;
