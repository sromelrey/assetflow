import { StyleSheet, Text, View, Alert, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

// Consolidated AssetDetails into index.tsx to bypass Metro resolution issues for now
function AssetDetails({ 
  asset, 
  onReset, 
  onUpdateStatus, 
  isUpdating 
}: { 
  asset: any; 
  onReset: () => void;
  onUpdateStatus: (newStatus: string) => Promise<void>;
  isUpdating: boolean;
}) {
  const [showStatusModal, setShowStatusModal] = useState(false);

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

  const statusOptions = [
    'Active',
    'Decommissioned',
    'Deployed',
    'For Repair',
    'For Deployment',
    'In Storage'
  ];

  const handleStatusSelect = async (status: string) => {
    setShowStatusModal(false);
    if (status !== asset.status) {
      await onUpdateStatus(status);
    }
  };

  const details = asset?.assetDetails;

  return (
    <SafeAreaView style={assetStyles.safeArea}>
      {/* Absolute Full-Width Status Banner */}
      <TouchableOpacity 
        style={[assetStyles.statusBanner, { backgroundColor: getStatusColor(asset.status) }]}
        onPress={() => setShowStatusModal(true)}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <View style={assetStyles.statusBannerContent}>
            <Text style={assetStyles.statusBannerLabel}>STATUS: </Text>
            <Text style={assetStyles.statusBannerText}>{asset.status.toUpperCase()}</Text>
            <Text style={assetStyles.statusDropdownArrow}> ▼</Text>
          </View>
        )}
      </TouchableOpacity>

      <ScrollView contentContainerStyle={assetStyles.containerWithBanner}>
        <View style={assetStyles.header}>
          <Text style={assetStyles.title}>{asset.name}</Text>
        </View>

        <View style={assetStyles.tagsContainer}>
          <View style={assetStyles.tag}>
            <Text style={assetStyles.tagLabel}>Asset #</Text>
            <Text style={assetStyles.tagValue}>{asset.assetNo || 'N/A'}</Text>
          </View>
          {asset.serialNo && (
            <View style={assetStyles.tag}>
              <Text style={assetStyles.tagLabel}>S/N</Text>
              <Text style={assetStyles.tagValue}>{asset.serialNo}</Text>
            </View>
          )}
        </View>

        {/* Core Information */}
        <View style={assetStyles.card}>
          <Text style={assetStyles.sectionTitle}>Core Information</Text>
          <View style={assetStyles.gridRow}>
            <View style={assetStyles.gridItem}>
              <Text style={assetStyles.label}>Category</Text>
              <Text style={assetStyles.value}>{asset.category?.name || 'None'}</Text>
            </View>
            <View style={assetStyles.gridItem}>
              <Text style={assetStyles.label}>Asset Type</Text>
              <Text style={assetStyles.value}>{asset.assetType || 'N/A'}</Text>
            </View>
          </View>
          <View style={[assetStyles.gridRow, { marginTop: 12 }]}>
            <View style={assetStyles.gridItem}>
              <Text style={assetStyles.label}>Purchase Date</Text>
              <Text style={assetStyles.value}>{formatDate(asset.purchaseDate)}</Text>
            </View>
            <View style={assetStyles.gridItem}>
              <Text style={assetStyles.label}>Unit Assignment</Text>
              <Text style={assetStyles.value}>{asset.unit?.name || 'Unassigned'}</Text>
            </View>
          </View>
        </View>

        {details && (
          <>
            {/* Hardware Specifications */}
            <View style={assetStyles.card}>
              <Text style={assetStyles.sectionTitle}>Hardware Specifications</Text>
              <View style={assetStyles.gridRow}>
                {details.brand && (
                  <View style={assetStyles.gridItem}>
                    <Text style={assetStyles.label}>Brand</Text>
                    <Text style={assetStyles.value}>{details.brand}</Text>
                  </View>
                )}
                {details.model && (
                  <View style={assetStyles.gridItem}>
                    <Text style={assetStyles.label}>Model</Text>
                    <Text style={assetStyles.value}>{details.model}</Text>
                  </View>
                )}
              </View>
              {(details.processor || details.memory) && (
                <View style={[assetStyles.gridRow, { marginTop: 12 }]}>
                  {details.processor && (
                    <View style={assetStyles.gridItem}>
                      <Text style={assetStyles.label}>Processor</Text>
                      <Text style={assetStyles.value}>{details.processor}</Text>
                    </View>
                  )}
                  {details.memory && (
                    <View style={assetStyles.gridItem}>
                      <Text style={assetStyles.label}>Memory</Text>
                      <Text style={assetStyles.value}>{details.memory}</Text>
                    </View>
                  )}
                </View>
              )}
              {details.storage && (
                <View style={[assetStyles.gridRow, { marginTop: 12 }]}>
                  <View style={assetStyles.gridItem}>
                    <Text style={assetStyles.label}>Storage</Text>
                    <Text style={assetStyles.value}>{details.storage}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Network & System */}
            <View style={assetStyles.card}>
              <Text style={assetStyles.sectionTitle}>Network & System</Text>
              {details.computerName && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={assetStyles.label}>Computer Name</Text>
                  <Text style={assetStyles.value}>{details.computerName}</Text>
                </View>
              )}
              <View style={assetStyles.gridRow}>
                {details.ipAddress && (
                  <View style={assetStyles.gridItem}>
                    <Text style={assetStyles.label}>IP Address</Text>
                    <Text style={assetStyles.value}>{details.ipAddress}</Text>
                  </View>
                )}
                {details.macAddress && (
                  <View style={assetStyles.gridItem}>
                    <Text style={assetStyles.label}>MAC Address</Text>
                    <Text style={assetStyles.value}>{details.macAddress}</Text>
                  </View>
                )}
              </View>
              {details.operatingSystem && (
                <View style={{ marginTop: 12 }}>
                  <Text style={assetStyles.label}>Operating System</Text>
                  <Text style={assetStyles.value}>{details.operatingSystem}</Text>
                </View>
              )}
            </View>

            {/* Administrative */}
            <View style={assetStyles.card}>
              <Text style={assetStyles.sectionTitle}>Administrative</Text>
              <View style={assetStyles.gridRow}>
                {details.poNumber && (
                  <View style={assetStyles.gridItem}>
                    <Text style={assetStyles.label}>PO Number</Text>
                    <Text style={assetStyles.value}>#{details.poNumber}</Text>
                  </View>
                )}
                {details.invoiceNumber && (
                  <View style={assetStyles.gridItem}>
                    <Text style={assetStyles.label}>Invoice Number</Text>
                    <Text style={assetStyles.value}>#{details.invoiceNumber}</Text>
                  </View>
                )}
              </View>
              {details.supplier && (
                <View style={{ marginTop: 12 }}>
                  <Text style={assetStyles.label}>Supplier</Text>
                  <Text style={assetStyles.value}>{details.supplier}</Text>
                </View>
              )}
              {details.remarks && (
                <View style={assetStyles.remarksContainer}>
                  <Text style={assetStyles.remarksLabel}>Remarks</Text>
                  <Text style={assetStyles.remarksText}>{details.remarks}</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Status Selection Modal */}
      {showStatusModal && (
        <View style={assetStyles.modalOverlay}>
          <View style={assetStyles.modalContent}>
            <Text style={assetStyles.modalTitle}>Select Status</Text>
            {statusOptions.map((option) => (
              <TouchableOpacity 
                key={option} 
                style={[
                  assetStyles.optionButton,
                  asset.status === option && assetStyles.optionButtonActive
                ]}
                onPress={() => handleStatusSelect(option)}
              >
                <Text style={[
                   assetStyles.optionText,
                   asset.status === option && assetStyles.optionTextActive
                ]}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={assetStyles.cancelOption} 
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={assetStyles.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={assetStyles.footer}>
        <TouchableOpacity style={assetStyles.scanButton} onPress={onReset}>
          <Text style={assetStyles.scanButtonText}>Close & Scan Another</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function ScanScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const { token, signOut } = useAuth();
  
  const [isActive, setIsActive] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assetData, setAssetData] = useState<any>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';

  useFocusEffect(
    useCallback(() => {
      console.log(`[ScanScreen] Focus effect triggered. State: scannedCode=${scannedCode}, isLoading=${isLoading}, error=${error}, assetData=${!!assetData}`);
      if (!scannedCode && !isLoading && !error && !assetData) {
        setIsActive(true);
      }
      return () => {
        setIsActive(false);
      };
    }, [scannedCode, isLoading, error, assetData])
  );

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!assetData?.assetNo) return;
    
    setIsUpdating(true);
    console.log(`[ScanScreen] Updating status of ${assetData.assetNo} to ${newStatus}`);
    
    try {
      const response = await fetch(`${API_URL}/asset/status-by-no/${assetData.assetNo}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.');
        await signOut();
        return;
      }

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }
      
      const updatedAsset = await response.json();
      console.log(`[ScanScreen] Status updated successfully!`);
      // Update local state to reflect change immediately
      setAssetData(updatedAsset);
      Alert.alert('Success', `Status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('[ScanScreen] Update exception:', err.message || err);
      Alert.alert('Update Failed', 'Could not update asset status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleScanCode = async (code: string) => {
    setIsActive(false);
    console.log(`[ScanScreen] Code detected: ${code}. Executing handleScanCode...`);
    setScannedCode(code);
    setIsLoading(true);
    setError(null);
    setAssetData(null);
    
    console.log(`[ScanScreen] Fetching asset: ${code} from ${API_URL}`);
    console.log(`[ScanScreen] Token available: ${!!token}, Token length: ${token?.length}`);

    try {
      const response = await fetch(`${API_URL}/asset/find-by-no/${encodeURIComponent(code)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`[ScanScreen] Response status for ${code}: ${response.status}`);
      
      if (response.status === 401) {
        console.log('[ScanScreen] Unauthorized (401). Signing out...');
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        await signOut();
        return;
      }

      if (response.status === 404) {
        setError(`Asset number "${code}" not found.`);
      } else if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      } else {
        const data = await response.json();
        console.log(`[ScanScreen] Fetch success! Data name: ${data.name}`);
        setAssetData(data);
      }
    } catch (err: any) {
      console.error('[ScanScreen] Fetch exception:', err.message || err);
      setError('A connection error occurred while retrieving the asset.');
    } finally {
      setIsLoading(false);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'code-128'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isActive) {
        if (codes[0].value) {
            handleScanCode(codes[0].value);
        }
      }
    },
  });

  const resetScanner = () => {
    setScannedCode(null);
    setError(null);
    setAssetData(null);
    setIsActive(true);
  };

  const handleManualLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => signOut(), style: 'destructive' }
      ]
    );
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera access is required</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
            <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No Camera device found</Text>
      </View>
    );
  }
  
  if (assetData) {
    return (
      <AssetDetails 
        asset={assetData} 
        onReset={resetScanner} 
        onUpdateStatus={handleUpdateStatus}
        isUpdating={isUpdating}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        codeScanner={codeScanner}
      />
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleManualLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {isLoading && (
        <View style={styles.overlayCentered}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.overlayText}>Fetching details for {scannedCode}...</Text>
        </View>
      )}

      {error && !isLoading && (
        <View style={styles.errorOverlay}>
             <Text style={styles.errorText}>{error}</Text>
             <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
                <Text style={styles.resetButtonText}>Tap to scan again</Text>
             </TouchableOpacity>

             <TouchableOpacity style={styles.errorLogoutLink} onPress={handleManualLogout}>
                <Text style={styles.errorLogoutText}>Switch account / Logout</Text>
             </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
  button: {
      marginTop: 20,
      padding: 12,
      backgroundColor: '#0f172a',
      borderRadius: 8
  },
  buttonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  },
  overlayCentered: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 30,
    borderRadius: 16,
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  errorOverlay: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    padding: 24,
    borderRadius: 16,
    width: '85%',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  errorLogoutLink: {
    marginTop: 20,
  },
  errorLogoutText: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline',
    opacity: 0.8,
  }
});

const assetStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  containerWithBanner: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 80, // Increased to accommodate banner margin
  },
  statusBanner: {
    position: 'absolute',
    top: 10, // Added margin from the absolute top
    left: 0,
    right: 0,
    height: 54,
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  statusBannerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBannerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusBannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusDropdownArrow: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
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
  remarksContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#cbd5e1',
  },
  remarksLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  optionText: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
  },
  optionTextActive: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  cancelOption: {
    marginTop: 8,
    paddingVertical: 12,
  },
  cancelOptionText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
