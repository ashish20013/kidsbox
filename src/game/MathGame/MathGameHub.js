import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const games = [
  {
    name: '',
    image: require('../../../assets/games/puzzle.png'),
    screen: 'MathPuzzleScreen',
    color: '#FFD93D',
  },
  {
    name: '',
    image: require('../../../assets/games/facts.png'),
    screen: 'MathFactsMaster',
    color: '#6BCB77',
  },
  {
    name: '',
    image: require('../../../assets/games/maze.png'),
    screen: 'MathMazeScreen',
    color: '#4D96FF',
  },
  {
    name: '',
    image: require('../../../assets/games/numbers.png'),
    screen: 'NumberPuzzleScreen',
    color: '#FF6B6B',
  },
];

export default function MathGameHub({ navigation }) {
  const animations = useRef(games.map(() => new Animated.Value(0))).current;
  const pressAnimations = useRef(
    games.map(() => new Animated.Value(1)),
  ).current;
  const shimmerAnim = useRef(games.map(() => new Animated.Value(-1))).current;

  const startAnimation = useCallback(() => {
    // Card entry animation
    Animated.stagger(
      150,
      animations.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 80,
        }),
      ),
    ).start();

    // Shimmer animation for each card
    shimmerAnim.forEach(anim => {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ).start();
    });
  }, [animations, shimmerAnim]);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  const handlePressIn = useCallback(
    index => {
      Animated.spring(pressAnimations[index], {
        toValue: 1.05,
        useNativeDriver: true,
        friction: 4,
      }).start();
    },
    [pressAnimations],
  );

  const handlePressOut = useCallback(
    index => {
      Animated.spring(pressAnimations[index], {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
      }).start();
    },
    [pressAnimations],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Math Game Collection</Text>
      <View style={styles.grid}>
        {games.map((game, index) => {
          const translateY = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          });
          const scaleEntry = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.85, 1],
          });
          const shimmerTranslate = shimmerAnim[index].interpolate({
            inputRange: [-1, 1],
            outputRange: [-width, width],
          });

          return (
            <Animated.View
              key={game.screen}
              style={[
                styles.cardWrapper,
                { transform: [{ translateY }, { scale: scaleEntry }] },
              ]}
            >
              <Animated.View
                style={{ transform: [{ scale: pressAnimations[index] }] }}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                  onPress={() => navigation.navigate(game.screen)}
                >
                  <ImageBackground
                    source={game.image}
                    style={[styles.card, { backgroundColor: game.color }]}
                    imageStyle={styles.cardImage}
                  >
                    <View style={styles.textWrapper}>
                      <Text style={styles.cardText}>{game.name}</Text>
                      <Animated.View
                        style={[
                          styles.shimmer,
                          { transform: [{ translateX: shimmerTranslate }] },
                        ]}
                      />
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 20,
    elevation: 8,
    height: 180,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    paddingBottom: 15,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    width: '100%',
  },
  cardImage: {
    borderRadius: 10,
    resizeMode: 'cover',
  },
  cardText: {
    color: '#a1d60fff',
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 6,
    zIndex: 2,
  },
  cardWrapper: {
    marginBottom: 25,
    width: width * 0.9,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#0a0f1b',
    flexGrow: 1,
    marginTop: 50,
    paddingVertical: 20,
  },
  grid: {
    alignItems: 'center',
    width: '100%',
  },
  shimmer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    height: 50,
    left: 0,
    position: 'absolute',
    top: 0,
    transform: [{ rotate: '20deg' }],
    width: 100,
    zIndex: 1,
  },
  textWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 20,
  },
  title: {
    color: '#FFD93D',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowRadius: 6,
  },
});
