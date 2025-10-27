import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { theme } from "../theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

// animation  start value
const startValue = 0;
// animation end value
const endValue = 1;

export default function FabButton({ children, onPress }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Track the true state
  // use shared value for start and end
  const animatedProgress = useSharedValue(startValue);

  const toggleMenu = () => {
    const nextState = !isMenuOpen;
    setIsMenuOpen(nextState);
    // if value is 1 go to 0 otherwise got to 1
    const toValue = nextState ? endValue : startValue;
    console.log(toValue);

    animatedProgress.value = withSpring(toValue, {
      damping: 5,
      stiffness: 90,
      overshootClamping: true, // <-
    });
  };

  //  Main FAB Icon Rotation (Plus to X) ---

  const rotationStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      animatedProgress.value,
      [startValue, endValue],
      [0, 45],
      Extrapolation.CLAMP
    ); // rotate from 0 to 45

    return {
      transform: [{ rotate: `${rotateValue}deg` }],
    };
  });

  // Sub buttons transition and opacity
  const createSubButtonStyle = (translateYValue) => {
    return useAnimatedStyle(() => {
      // Map progress (0 to 1) to the actual vertical movement
      const translateY = interpolate(
        animatedProgress.value,
        [startValue, endValue],
        [0, translateYValue],
        Extrapolation.CLAMP
      );

      // Map progress (0 to 1) to opacity
      const opacity = interpolate(
        animatedProgress.value,
        [startValue, endValue],
        [0, 1],
        Extrapolation.CLAMP
      );

      // Map progress (0 to 1) to scale (hidden vs visible)
      const scale = interpolate(
        animatedProgress.value,
        [startValue, endValue],
        [0, 1], // Scale from 0.5 (smaller/hidden) to 1 (visible)
        Extrapolation.CLAMP
      );

      return {
        opacity: opacity,
        transform: [{ translateY: translateY }, { scale: scale }],
      };
    });
  };

  const inviteStyle = createSubButtonStyle(-120); // Moves up 120px
  const apptStyle = createSubButtonStyle(-60); // Moves up 60px

  return (
    <View style={styles.fabWrapper}>
      {/* --- Sub-Buttons --- */}

      {/* 2. Create Invitation Button */}
      <Animated.View style={[styles.subButton, inviteStyle]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/invite-flow")}
        >
          <MaterialIcons name="person-add" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* 1. Create Appointment Button */}
      <Animated.View style={[styles.subButton, apptStyle]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            toggleMenu();
            router.push("/new-appointment");
          }}
        >
          <MaterialIcons name="event-available" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* --- Main FAB --- */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View style={[rotationStyle]}>
          <MaterialIcons name="add" size={30} color="white" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ensure styles from the previous response are here for proper positioning
  fabWrapper: {
    top: -20,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fabButton: {
    backgroundColor: theme.colorDarkPink,
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  subButton: {
    position: "absolute",
    justifyContent: "center",
    zIndex: 1,
    right: -125,
    pointerEvents: "box-none",
  },
  actionButton: {
    backgroundColor: theme.colorDarkPink,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});
