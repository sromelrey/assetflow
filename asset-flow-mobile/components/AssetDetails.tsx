import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

interface AssetDetailsProps {
  asset: any;
  onReset: () => void;
}

export default function AssetDetails({ asset, onReset }: AssetDetailsProps) {
  // Helpers
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Decommissioned': return '#64748b';
      case 'Deployed': return '#3b82f6';
      case 'For Repair': return '#f59e0b';
      case 'For Deployment': return '#6366f1';
      case 'In Storage': return '#a855f7';
      default: return '#9ca3af';
    }
  };

  const details = asset?.assetDetails;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{asset.name}</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(asset.status) }]}>
            <Text style={styles.badgeText}>{asset.status}</Text>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagLabel}>Asset #</Text>
            <Text style={styles.tagValue}>{asset.assetNo || 'N/A'}</Text>
          </View>
          {asset.serialNo && (
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>S/N</Text>
              <Text style={styles.tagValue}>{asset.serialNo}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Core Information</Text>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{asset.category?.name || 'None'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Asset Type</Text>
              <Text style={styles.value}>{asset.assetType || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Purchase Date</Text>
              <Text style={styles.value}>{formatDate(asset.purchaseDate)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Unit Assignment</Text>
              <Text style={styles.value}>{asset.unit?.name || 'Unassigned'}</Text>
            </View>
          </View>
        </View>

        {details && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Hardware Specifications</Text>
            <View style={styles.gridRow}>
              {details.brand && (
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Brand</Text>
                  <Text style={styles.value}>{details.brand}</Text>
                </View>
              )}
              {details.model && (
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Model</Text>
                  <Text style={styles.value}>{details.model}</Text>
                </View>
              )}
            </View>

            {details.operatingSystem && (
                <View style={[styles.gridRow, { marginTop: 12 }]}>
                    <View style={styles.gridItemFull}>
                        <Text style={styles.label}>Operating System</Text>
                        <Text style={styles.value}>{details.operatingSystem}</Text>
                    </View>
                </View>
            )}

            <View style={[styles.gridRow, { marginTop: 12 }]}>
              {details.processor && (
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Processor</Text>
                  <Text style={styles.value}>{details.processor}</Text>
                </View>
              )}
              {details.memory && (
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Memory</Text>
                  <Text style={styles.value}>{details.memory}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.scanButton} onPress={onReset}>
          <Text style={styles.scanButtonText}>Close & Scan Another</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  tagLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 6,
  },
  tagValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  gridItem: {
    flex: 1,
  },
  gridItemFull: {
    flex: 1,
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  scanButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
