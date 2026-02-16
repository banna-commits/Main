import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FadeView from '../components/FadeView';
import BodySilhouette from '../components/BodySilhouette';
import { colors } from '../utils/theme';
import { useSession } from '../context/SessionContext';

export default function BodyScanScreen() {
  const { nextStep } = useSession();

  useEffect(() => {
    const timer = setTimeout(nextStep, 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={[colors.bgDark, colors.bgDeep]} style={styles.gradient}>
      <View style={styles.container}>
        <FadeView style={styles.textWrap} delay={500}>
          <Text style={styles.title}>Body Scan</Text>
          <Text style={styles.body}>
            Notice your body from head to toe…{'\n'}what stands out?
          </Text>
        </FadeView>

        <FadeView delay={1200}>
          <BodySilhouette breathing />
        </FadeView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  textWrap: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 14, color: colors.whiteSubtle, letterSpacing: 4, textTransform: 'uppercase', fontWeight: '500' },
  body: { fontSize: 18, color: colors.whiteSoft, fontWeight: '300', textAlign: 'center', lineHeight: 28, marginTop: 12 },
});
