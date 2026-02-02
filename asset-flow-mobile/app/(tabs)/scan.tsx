import { StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { useState, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function ScanScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [isActive, setIsActive] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
      };
    }, [])
  );

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'upc-a'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isActive) {
        setScannedCode(codes[0].value ?? null);
        setIsActive(false); // Stop scanning momentarily
        Alert.alert('Scanned Code', codes[0].value, [
          {
            text: 'OK',
            onPress: () => {
                setScannedCode(null)
                setIsActive(true);
            },
          },
        ]);
      }
    },
  });

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No Camera Permission</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
            <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No Camera Device Found</Text>
      </View>
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
      {scannedCode && (
        <View style={styles.overlay}>
             <Text style={styles.overlayText}>Code: {scannedCode}</Text>
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
    fontSize: 20,
  },
  button: {
      marginTop: 20,
      padding: 10,
      backgroundColor: '#0a7ea4',
      borderRadius: 5
  },
  buttonText: {
      color: 'white',
      fontWeight: 'bold'
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 10,
  },
  overlayText: {
    color: 'white',
    fontSize: 18,
  },
});
