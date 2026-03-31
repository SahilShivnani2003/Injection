import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';
import { LoaderType, LoaderSize, LoaderProps } from '../types/loader';

const { width, height } = Dimensions.get('window');

const Loader: React.FC<LoaderProps> = ({
  type = 'spinner',
  size = 'medium',
  color,
  gradientColors,
  text,
  textColor,
  backgroundColor,
  overlay = false,
  style,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      case 'xlarge':
        return 64;
      case 'medium':
      default:
        return 36;
    }
  };

  const loaderSize = getSize();
  const primaryColor = color || Colors.gradientStart;
  const gradient = gradientColors || [Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd];

  const renderSpinner = () => {
    const spinAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }, []);

    const spin = spinAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.spinnerContainer,
          { transform: [{ rotate: spin }] },
        ]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.spinner, { width: loaderSize, height: loaderSize }]}
        />
        <View style={[styles.spinnerHole, { width: loaderSize * 0.6, height: loaderSize * 0.6 }]} />
      </Animated.View>
    );
  };

  const renderDots = () => {
    const dot1Anim = useRef(new Animated.Value(0)).current;
    const dot2Anim = useRef(new Animated.Value(0)).current;
    const dot3Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animateDot = (anim: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateDot(dot1Anim, 0);
      animateDot(dot2Anim, 200);
      animateDot(dot3Anim, 400);
    }, []);

    const dotSize = loaderSize * 0.2;

    return (
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              backgroundColor: primaryColor,
              transform: [{ scale: dot1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              backgroundColor: primaryColor,
              transform: [{ scale: dot2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              backgroundColor: primaryColor,
              transform: [{ scale: dot3Anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
            },
          ]}
        />
      </View>
    );
  };

  const renderPulse = () => {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    const scale = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1.2],
    });

    const opacity = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
    });

    return (
      <Animated.View
        style={[
          styles.pulseContainer,
          {
            width: loaderSize,
            height: loaderSize,
            borderRadius: loaderSize / 2,
            backgroundColor: primaryColor,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    );
  };

  const renderBars = () => {
    const bar1Anim = useRef(new Animated.Value(0)).current;
    const bar2Anim = useRef(new Animated.Value(0)).current;
    const bar3Anim = useRef(new Animated.Value(0)).current;
    const bar4Anim = useRef(new Animated.Value(0)).current;
    const bar5Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animateBar = (anim: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 300,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 300,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateBar(bar1Anim, 0);
      animateBar(bar2Anim, 100);
      animateBar(bar3Anim, 200);
      animateBar(bar4Anim, 300);
      animateBar(bar5Anim, 400);
    }, []);

    const barWidth = loaderSize * 0.12;
    const barHeight = loaderSize;

    return (
      <View style={styles.barsContainer}>
        {[bar1Anim, bar2Anim, bar3Anim, bar4Anim, bar5Anim].map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                width: barWidth,
                height: barHeight,
                backgroundColor: primaryColor,
                transform: [
                  {
                    scaleY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderRing = () => {
    const ringAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.loop(
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }, []);

    const rotate = ringAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={[styles.ringContainer, { width: loaderSize, height: loaderSize }]}>
        <Animated.View
          style={[
            styles.ring,
            {
              width: loaderSize,
              height: loaderSize,
              borderRadius: loaderSize / 2,
              borderWidth: loaderSize * 0.1,
              borderColor: primaryColor,
              borderTopColor: 'transparent',
              transform: [{ rotate }],
            },
          ]}
        />
      </View>
    );
  };

  const renderBounce = () => {
    const bounce1Anim = useRef(new Animated.Value(0)).current;
    const bounce2Anim = useRef(new Animated.Value(0)).current;
    const bounce3Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animateBounce = (anim: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateBounce(bounce1Anim, 0);
      animateBounce(bounce2Anim, 200);
      animateBounce(bounce3Anim, 400);
    }, []);

    const dotSize = loaderSize * 0.25;

    return (
      <View style={styles.bounceContainer}>
        <Animated.View
          style={[
            styles.bounceDot,
            {
              width: dotSize,
              height: dotSize,
              backgroundColor: primaryColor,
              transform: [
                {
                  translateY: bounce1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -loaderSize * 0.3],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.bounceDot,
            {
              width: dotSize,
              height: dotSize,
              backgroundColor: primaryColor,
              transform: [
                {
                  translateY: bounce2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -loaderSize * 0.3],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.bounceDot,
            {
              width: dotSize,
              height: dotSize,
              backgroundColor: primaryColor,
              transform: [
                {
                  translateY: bounce3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -loaderSize * 0.3],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    );
  };

  const renderWave = () => {
    const waveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }, []);

    const translateX = waveAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-loaderSize, loaderSize],
    });

    return (
      <View style={[styles.waveContainer, { width: loaderSize, height: loaderSize * 0.6 }]}>
        <Animated.View
          style={[
            styles.wave,
            {
              width: loaderSize * 2,
              height: loaderSize * 0.6,
              backgroundColor: primaryColor,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    );
  };

  const renderGradient = () => {
    const gradientAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.loop(
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }, []);

    const translateX = gradientAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-loaderSize, loaderSize],
    });

    return (
      <View style={[styles.gradientContainer, { width: loaderSize, height: loaderSize * 0.3 }]}>
        <Animated.View
          style={[
            styles.gradientBar,
            {
              width: loaderSize * 0.6,
              height: loaderSize * 0.3,
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientFill}
          />
        </Animated.View>
      </View>
    );
  };

  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return renderSpinner();
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bars':
        return renderBars();
      case 'ring':
        return renderRing();
      case 'bounce':
        return renderBounce();
      case 'wave':
        return renderWave();
      case 'gradient':
        return renderGradient();
      default:
        return renderSpinner();
    }
  };

  const loaderContent = (
    <View style={[styles.container, style]}>
      {renderLoader()}
      {text && (
        <Text style={[styles.text, { color: textColor || Colors.textMedium }]}>
          {text}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible={true} animationType="fade">
        <View style={[styles.overlay, { backgroundColor: backgroundColor || 'rgba(0,0,0,0.5)' }]}>
          {loaderContent}
        </View>
      </Modal>
    );
  }

  return loaderContent;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Spinner
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderRadius: 50,
  },
  spinnerHole: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 50,
  },

  // Dots
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 60,
  },
  dot: {
    borderRadius: 50,
  },

  // Pulse
  pulseContainer: {},

  // Bars
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: 50,
  },
  bar: {
    borderRadius: 2,
  },

  // Ring
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderStyle: 'solid',
  },

  // Bounce
  bounceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 50,
  },
  bounceDot: {
    borderRadius: 50,
  },

  // Wave
  waveContainer: {
    overflow: 'hidden',
    borderRadius: 2,
  },
  wave: {
    borderRadius: 2,
  },

  // Gradient
  gradientContainer: {
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: Colors.inputBg,
  },
  gradientBar: {
    borderRadius: 2,
  },
  gradientFill: {
    flex: 1,
    borderRadius: 2,
  },
});

export default Loader;