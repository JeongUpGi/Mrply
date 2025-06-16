import React, {useState} from 'react';
import {
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import {TextInputModalProps} from '../../model/model';
import {colors} from '../../asset/color/color';

const TextInputModal: React.FC<TextInputModalProps> = ({
  title,
  inputTitle,
  visible,
  onClose,
  onConfirm,
  onChangeTitle,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            style={styles.input}
            value={inputTitle}
            onChangeText={onChangeTitle}
            placeholder="플레이리스트 제목"
            placeholderTextColor={colors.gray_808080}
            maxLength={50}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
            <View style={{width: 5}} />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}>
              <Text style={styles.buttonText}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray_dcdcdc,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    color: colors.black,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    width: '50%',
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.gray_dcdcdc,
  },
  confirmButton: {
    width: '50%',
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.green_1DB954,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default TextInputModal;
