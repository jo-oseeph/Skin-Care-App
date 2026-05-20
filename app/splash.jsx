import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import Animated, {
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";

import { colors } from "../src/constants/colors";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop",
        }}
        contentFit="cover"
        style={styles.image}
      />

      {/* Overlay */}
      <LinearGradient
        colors={[
          "rgba(250,245,241,0.1)",
          "rgba(250,245,241,0.6)",
          "#FAF5F1",
        ]}
        style={styles.overlay}
      />

      {/* Content */}
      <View style={styles.content}>
        <Animated.View entering={FadeIn.delay(200)}>
          <Text style={styles.logo}>LUMERA</Text>
          <Text style={styles.subLogo}>SKINCARE</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={styles.title}>
            Glow Naturally,{"\n"}Feel Beautiful
          </Text>

          <Text style={styles.description}>
            Premium skincare products crafted to nourish,
            hydrate and reveal your natural beauty.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).springify()}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.button}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.explore}>
              Explore Products
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  image: {
    width: width,
    height: height,
    position: "absolute",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 60,
  },

  logo: {
    fontSize: 34,
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 6,
    textAlign: "center",
  },

  subLogo: {
    textAlign: "center",
    color: colors.textSecondary,
    letterSpacing: 4,
    marginTop: 4,
    marginBottom: 40,
    fontSize: 12,
  },

  title: {
    fontSize: 42,
    lineHeight: 50,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 18,
  },

  description: {
    fontSize: 15,
    lineHeight: 26,
    color: colors.textSecondary,
    marginBottom: 38,
  },

  button: {
    backgroundColor: colors.primary,
    height: 60,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },

  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },

  explore: {
    textAlign: "center",
    marginTop: 22,
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
});