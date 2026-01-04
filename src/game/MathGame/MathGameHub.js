// import React, { useEffect, useRef, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ImageBackground,
//   ScrollView,
//   Animated,
//   Dimensions,
// } from 'react-native';

// const { width } = Dimensions.get('window');

// const games = [
//   {
//     name: '',
//     image: require('../../../assets/games/puzzle.png'),
//     screen: 'MathPuzzleScreen',
//     color: '#FFD93D',
//   },
//   {
//     name: '',
//     image: require('../../../assets/games/facts.png'),
//     screen: 'MathFactsMaster',
//     color: '#6BCB77',
//   },
//   {
//     name: '',
//     image: require('../../../assets/games/maze.png'),
//     screen: 'MathMazeScreen',
//     color: '#4D96FF',
//   },
//   {
//     name: '',
//     image: require('../../../assets/games/numbers.png'),
//     screen: 'NumberPuzzleScreen',
//     color: '#FF6B6B',
//   },
// ];

// export default function MathGameHub({ navigation }) {
//   const animations = useRef(games.map(() => new Animated.Value(0))).current;
//   const pressAnimations = useRef(
//     games.map(() => new Animated.Value(1)),
//   ).current;
//   const shimmerAnim = useRef(games.map(() => new Animated.Value(-1))).current;

//   const startAnimation = useCallback(() => {
//     // Card entry animation
//     Animated.stagger(
//       150,
//       animations.map(anim =>
//         Animated.spring(anim, {
//           toValue: 1,
//           useNativeDriver: true,
//           friction: 6,
//           tension: 80,
//         }),
//       ),
//     ).start();

//     // Shimmer animation for each card
//     shimmerAnim.forEach(anim => {
//       Animated.loop(
//         Animated.timing(anim, {
//           toValue: 1,
//           duration: 2000,
//           useNativeDriver: true,
//         }),
//       ).start();
//     });
//   }, [animations, shimmerAnim]);

//   useEffect(() => {
//     startAnimation();
//   }, [startAnimation]);

//   const handlePressIn = useCallback(
//     index => {
//       Animated.spring(pressAnimations[index], {
//         toValue: 1.05,
//         useNativeDriver: true,
//         friction: 4,
//       }).start();
//     },
//     [pressAnimations],
//   );

//   const handlePressOut = useCallback(
//     index => {
//       Animated.spring(pressAnimations[index], {
//         toValue: 1,
//         useNativeDriver: true,
//         friction: 4,
//       }).start();
//     },
//     [pressAnimations],
//   );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Math Game Collection</Text>
//       <View style={styles.grid}>
//         {games.map((game, index) => {
//           const translateY = animations[index].interpolate({
//             inputRange: [0, 1],
//             outputRange: [50, 0],
//           });
//           const scaleEntry = animations[index].interpolate({
//             inputRange: [0, 1],
//             outputRange: [0.85, 1],
//           });
//           const shimmerTranslate = shimmerAnim[index].interpolate({
//             inputRange: [-1, 1],
//             outputRange: [-width, width],
//           });

//           return (
//             <Animated.View
//               key={game.screen}
//               style={[
//                 styles.cardWrapper,
//                 { transform: [{ translateY }, { scale: scaleEntry }] },
//               ]}
//             >
//               <Animated.View
//                 style={{ transform: [{ scale: pressAnimations[index] }] }}
//               >
//                 <TouchableOpacity
//                   activeOpacity={0.9}
//                   onPressIn={() => handlePressIn(index)}
//                   onPressOut={() => handlePressOut(index)}
//                   onPress={() => navigation.navigate(game.screen)}
//                 >
//                   <ImageBackground
//                     source={game.image}
//                     style={[styles.card, { backgroundColor: game.color }]}
//                     imageStyle={styles.cardImage}
//                   >
//                     <View style={styles.textWrapper}>
//                       <Text style={styles.cardText}>{game.name}</Text>
//                       <Animated.View
//                         style={[
//                           styles.shimmer,
//                           { transform: [{ translateX: shimmerTranslate }] },
//                         ]}
//                       />
//                     </View>
//                   </ImageBackground>
//                 </TouchableOpacity>
//               </Animated.View>
//             </Animated.View>
//           );
//         })}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     alignItems: 'center',
//     borderRadius: 20,
//     elevation: 8,
//     height: 180,
//     justifyContent: 'flex-end',
//     overflow: 'hidden',
//     paddingBottom: 15,
//     shadowColor: '#fff',
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     width: '100%',
//   },
//   cardImage: {
//     borderRadius: 10,
//     resizeMode: 'cover',
//   },
//   cardText: {
//     color: '#a1d60fff',
//     fontSize: 22,
//     fontWeight: '900',
//     textShadowColor: 'rgba(0,0,0,0.7)',
//     textShadowRadius: 6,
//     zIndex: 2,
//   },
//   cardWrapper: {
//     marginBottom: 25,
//     width: width * 0.9,
//   },
//   container: {
//     alignItems: 'center',
//     backgroundColor: '#0a0f1b',
//     flexGrow: 1,
//     marginTop: 50,
//     paddingVertical: 20,
//   },
//   grid: {
//     alignItems: 'center',
//     width: '100%',
//   },
//   shimmer: {
//     backgroundColor: 'rgba(255,255,255,0.3)',
//     height: 50,
//     left: 0,
//     position: 'absolute',
//     top: 0,
//     transform: [{ rotate: '20deg' }],
//     width: 100,
//     zIndex: 1,
//   },
//   textWrapper: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     left: 0,
//     position: 'absolute',
//     right: 0,
//     top: 20,
//   },
//   title: {
//     color: '#FFD93D',
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 5,
//     textShadowColor: 'rgba(255,255,255,0.3)',
//     textShadowRadius: 6,
//   },
// });
import React, { useEffect, useRef, useCallback, useState } from 'react';
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
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const isLandscape = dimensions.width > dimensions.height;

  const animations = useRef(games.map(() => new Animated.Value(0))).current;
  const pressAnimations = useRef(
    games.map(() => new Animated.Value(1)),
  ).current;
  const shimmerAnim = useRef(games.map(() => new Animated.Value(-1))).current;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

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

  // Calculate card size based on orientation - FIXED
  const getCardSize = () => {
    const { width, height } = dimensions;

    if (isLandscape) {
      // In landscape: 2x2 grid, but don't take too much height
      const availableHeight = height * 0.8; // 80% of screen height max
      const availableWidth = width * 0.9; // 90% of screen width

      // Calculate for 2 columns, 2 rows
      const cardWidth = availableWidth / 2 - 20; // Minus margins
      const cardHeight = Math.min(availableHeight / 2, cardWidth); // Keep square-ish

      return { width: cardWidth, height: cardHeight };
    } else {
      // In portrait: 4 cards in column
      return { width: width * 0.9, height: 180 };
    }
  };

  const cardSize = getCardSize();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isLandscape && styles.containerLandscape,
      ]}
      showsVerticalScrollIndicator={!isLandscape}
      showsHorizontalScrollIndicator={false}
    >
      <View style={[styles.grid, isLandscape && styles.gridLandscape]}>
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
            outputRange: [-dimensions.width, dimensions.width],
          });

          return (
            <Animated.View
              key={game.screen}
              style={[
                styles.cardWrapper,
                isLandscape && styles.cardWrapperLandscape,
                {
                  transform: [{ translateY }, { scale: scaleEntry }],
                  width: cardSize.width,
                  height: cardSize.height,
                  marginBottom: isLandscape ? 15 : 25,
                },
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
                  style={styles.touchable}
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
  container: {
    flexGrow: 1,
    backgroundColor: '#0a0f1b',
    alignItems: 'center',
    paddingVertical: 20,
    justifyContent: 'center',
    minHeight: '100%',
    paddingTop: 50,
  },
  containerLandscape: {
    paddingVertical: 10,
  },
  grid: {
    alignItems: 'center',
    width: '100%',
  },
  gridLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 10,
  },
  cardWrapper: {
    // Default portrait styles
  },
  cardWrapperLandscape: {
    marginHorizontal: 10,
  },
  touchable: {
    width: '100%',
    height: '100%',
  },
  card: {
    alignItems: 'center',
    borderRadius: 20,
    elevation: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    paddingBottom: 15,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    width: '100%',
    height: '100%',
  },
  cardImage: {
    borderRadius: 20,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  cardText: {
    color: '#a1d60fff',
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 6,
    zIndex: 2,
  },
  textWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 20,
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
});
