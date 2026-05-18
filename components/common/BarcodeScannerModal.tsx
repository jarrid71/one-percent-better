// components/common/BarcodeScannerModal.tsx

import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAppTheme } from "@/context/ThemeContext";

type BarcodeScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onScanned: (barcode: string) => void;
};

export default function BarcodeScannerModal({
  visible,
  onClose,
  onScanned,
}: BarcodeScannerModalProps) {
  const { colors } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);

  const styles = createStyles(colors);

  const handleCameraReady = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert(
          "Camera permission needed",
          "Please allow camera access to scan barcodes."
        );
        onClose();
      }
    }

    setHasScanned(false);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (hasScanned) return;

    setHasScanned(true);
    onScanned(data);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onShow={handleCameraReady}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: [
              "ean13",
              "ean8",
              "upc_a",
              "upc_e",
              "qr",
              "code128",
              "code39",
            ],
          }}
          onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
        />

        <View style={styles.footer}>
          <Text style={styles.title}>Scan a barcode</Text>

          <Text style={styles.text}>
            Point your camera at the product barcode.
          </Text>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    camera: {
      flex: 1,
    },
    footer: {
      backgroundColor: colors.card,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 6,
    },
    text: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: 10,
    },
    cancelButton: {
      backgroundColor: colors.surface,
      padding: 14,
      borderRadius: 14,
      alignItems: "center",
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
      fontWeight: "700",
    },
  });