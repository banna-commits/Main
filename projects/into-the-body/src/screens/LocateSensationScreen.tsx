import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FadeView from '../components/FadeView';
import BodySilhouette, { BodyZone } from '../components/BodySilhouette';
import { colors } from '../utils/theme';
import { useSession } from '../context/SessionContext';

export default function LocateSensationScreen() {
  const { selectedZone, setSelectedZone, nextStep } = useSession();

  const handleZoneTap = (zone: BodyZone) => {
    setSelectedZone(zone.id);
    setTimeout(nextStep, 800);
  };

  return (
    <LinearGradient colors={[colors.bgDark, colors.bgDeep]} style={styles.gradient}>
      <View style={styles.container}>
        <FadeView style={styles.textWrap} delay={300}>
          <Text style={styles.title}>Locate Sensation</Text>
          <Text style={styles.body}>
            Tap where you feel{'\n'}the strongest sensation
          </Text>
        </FadeView>

        <FadeView delay={600}>
          <BodySilhouette tappable selectedZone={selectedZone} onZoneTap={handleZoneTap} />
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
