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
          "#F6DDCF",
          "rgba(246,221,207,0.55)",
          "#F6DDCF",
        ]}
        style={styles.overlay}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* TOP BRAND */}
        <Animated.View entering={FadeIn.delay(200)}>
          <Text style={styles.logo}>LUMERA</Text>
        </Animated.View>

        {/* CENTER IMAGE */}
        <Animated.View
          entering={FadeInDown.delay(350).springify()}
          style={styles.imageWrap}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1612810436541-336d4a5a2c8f?q=80&w=1200&auto=format&fit=crop",
            }}
            style={styles.productImage}
            contentFit="contain"
          />
        </Animated.View>

        {/* BOTTOM */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <Text style={styles.title}>
            Reveal Your Natural Glow
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.button}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text style={styles.buttonText}>
              Get Started
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
    width,
    height,
    position: "absolute",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 60,
    paddingHorizontal: 24,
  },

  logo: {
    fontSize: 28,
    letterSpacing: 6,
    fontWeight: "700",
    color: colors.text,
  },

  imageWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  productImage: {
    width: 280,
    height: 280,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: 18,
  },

  button: {
    width: width * 0.85,
    height: 58,
    borderRadius: 999,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});