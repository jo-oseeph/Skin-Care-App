import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Colors } from "../constants/theme";

export default function SplashScreen({ onGetStarted }) {
  const [loading, setLoading] = useState(true);
  const shimmer = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
    setTimeout(() => setLoading(false), 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lumière Skin</Text>
      <Text style={styles.subtitle}>
        Beauty gives you the confidence you deserve.
      </Text>
      <Image
        source={require("../assets/images/splash.png")}
        style={styles.image}
        resizeMode="contain"
      />
      {loading ? (
        <Animated.View style={[styles.skeleton, { opacity: shimmer }]} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={onGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontFamily: "Playfair Display",
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 8,
    marginTop: 32,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Playfair Display",
    fontSize: 14,
    color: Colors.light.primary,
    marginBottom: 24,
    textAlign: "center",
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.light.button,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginTop: 24,
  },
  buttonText: {
    color: Colors.light.accent,
    fontSize: 18,
    fontFamily: "Playfair Display",
    fontWeight: "600",
  },
  skeleton: {
    width: 180,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5d3c6",
    marginTop: 24,
  },
});
