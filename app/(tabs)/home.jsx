import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../src/constants/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                          // take up full screen
    justifyContent: 'center',         // center vertically
    alignItems: 'center',             // center horizontally
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '600',
  },
});