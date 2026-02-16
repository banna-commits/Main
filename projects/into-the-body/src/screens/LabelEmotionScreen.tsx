import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FadeView from '../components/FadeView';
import { colors } from '../utils/theme';
import { useSession } from '../context/SessionContext';

const EMOTIONS = [
  { emoji: '😢', label: 'sad' },
  { emoji: '😌', label: 'calm' },
  { emoji: '😤', label: 'frustrated' },
  { emoji: '✨', label: 'light' },
  { emoji: '🌿', label: 'open' },
  { emoji: '🪨', label: 'grounded' },
];

export default function LabelEmotionScreen() {
  const { emotion, setEmotion, emotionText, setEmotionText, nextStep } = useSession();

  const handleSelect = (label: string) => {
    setEmotion(label);
    setTimeout(nextStep, 600);
  };

  return (
    <LinearGradient colors={[colors.bgDark, colors.bgDeep]} style={styles.gradient}>
      <View style={styles.container}>
        <FadeView style={styles.textWrap} delay={300}>
          <Text style={styles.title}>Label the Emotion</Text>
          <Text style={styles.body}>
            If this sensation had an{'\n'}emotion or message,{'\n'}what would it be?
          </Text>
        </FadeView>

        <FadeView style={styles.grid} delay={700}>
          {EMOTIONS.map((e) => (
            <TouchableOpacity
              key={e.label}
              style={[styles.emotionBtn, emotion === e.label && styles.emotionBtnActive]}
              onPress={() => handleSelect(e.label)}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{e.emoji}</Text>
              <Text style={[styles.emotionLabel, emotion === e.label && styles.emotionLabelActive]}>
                {e.label}
              </Text>
            </TouchableOpacity>
          ))}
        </FadeView>

        <FadeView style={styles.inputWrap} delay={1000}>
          <TextInput
            style={styles.input}
            placeholder="or type something…"
            placeholderTextColor={colors.whiteSubtle}
            value={emotionText}
            onChangeText={setEmotionText}
            onSubmitEditing={nextStep}
            returnKeyType="done"
          />
        </FadeView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  textWrap: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 14, color: colors.whiteSubtle, letterSpacing: 4, textTransform: 'uppercase', fontWeight: '500' },
  body: { fontSize: 18, color: colors.whiteSoft, fontWeight: '300', textAlign: 'center', lineHeight: 28, marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  emotionBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(184, 181, 255, 0.2)',
    backgroundColor: 'rgba(108, 99, 255, 0.06)',
    width: 95,
  },
  emotionBtnActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.25)',
    borderColor: colors.purpleSoft,
  },
  emoji: { fontSize: 28, marginBottom: 6 },
  emotionLabel: { fontSize: 13, color: colors.whiteSoft, fontWeight: '300' },
  emotionLabelActive: { color: colors.white },
  inputWrap: { marginTop: 30, width: '100%', alignItems: 'center' },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(184, 181, 255, 0.3)',
    color: colors.white,
    fontSize: 16,
    fontWeight: '300',
    paddingVertical: 10,
    width: 240,
    textAlign: 'center',
  },
});
