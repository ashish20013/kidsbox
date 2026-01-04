// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo,
// } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   Easing,
//   Platform,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Sound from 'react-native-sound';
// // import Sound from 'react-native-sound-media';

// Sound.setCategory('Playback');

// /* ------------------------ SOUND HOOK (safe helper) ------------------------ */
// const useGameSounds = () => {
//   const correctRef = useRef(null);
//   const wrongRef = useRef(null);
//   const overRef = useRef(null);

//   useEffect(() => {
//     correctRef.current = new Sound('correct.mp3', Sound.MAIN_BUNDLE, e => {
//       if (!e) {
//         correctRef.current.setVolume(0.9);
//       }
//     });
//     wrongRef.current = new Sound('wrong.mp3', Sound.MAIN_BUNDLE, e => {
//       if (!e) {
//         wrongRef.current.setVolume(0.9);
//       }
//     });
//     overRef.current = new Sound('gameover.mp3', Sound.MAIN_BUNDLE, e => {
//       if (!e) {
//         overRef.current.setVolume(0.9);
//       }
//     });

//     return () => {
//       correctRef.current?.release();
//       wrongRef.current?.release();
//       overRef.current?.release();
//     };
//   }, []);

//   const play = useCallback(ref => {
//     const s = ref.current;
//     if (!s) {
//       return;
//     }
//     if (!s.isLoaded()) {
//       setTimeout(() => s.isLoaded() && s.play(() => s.setCurrentTime(0)), 80);
//       return;
//     }
//     s.setCurrentTime(0);
//     s.play(() => s.setCurrentTime(0));
//   }, []);

//   return useMemo(
//     () => ({
//       playCorrect: () => play(correctRef),
//       playWrong: () => play(wrongRef),
//       playGameOver: () => play(overRef),
//     }),
//     [play],
//   );
// };

// /* ------------------------------- MAIN SCREEN ------------------------------- */
// export default function TapTheColorScreen() {
//   const INITIAL_TIME = 30;

//   const [targetColor, setTargetColor] = useState('red');
//   const [score, setScore] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
//   const [gameOver, setGameOver] = useState(false);
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [difficulty, setDifficulty] = useState('easy');

//   const { playCorrect, playWrong, playGameOver } = useGameSounds();

//   const pulseAnim = useRef(new Animated.Value(0)).current;
//   const progressAnim = useRef(new Animated.Value(1)).current;

//   const colors = useMemo(
//     () => ({
//       easy: ['#ff5252', '#448aff', '#4caf50', '#ffd740'],
//       medium: [
//         '#ff5252',
//         '#448aff',
//         '#4caf50',
//         '#ffd740',
//         '#ab47bc',
//         '#ff9800',
//       ],
//       hard: [
//         '#ff5252',
//         '#448aff',
//         '#4caf50',
//         '#ffd740',
//         '#ab47bc',
//         '#ff9800',
//         '#ec407a',
//         '#6d4c41',
//       ],
//     }),
//     [],
//   );

//   const pickRandomColor = useCallback(() => {
//     const set = colors[difficulty];
//     setTargetColor(set[Math.floor(Math.random() * set.length)]);
//   }, [colors, difficulty]);

//   const finishGame = useCallback(async () => {
//     setGameOver(true);
//     playGameOver();

//     try {
//       const entry = { score, difficulty, date: new Date().toLocaleString() };
//       const updated = [...leaderboard, entry]
//         .sort((a, b) => b.score - a.score)
//         .slice(0, 5);
//       setLeaderboard(updated);
//       await AsyncStorage.setItem('@ttc_leaderboard', JSON.stringify(updated));
//     } catch (e) {
//       console.log('Leaderboard save error:', e);
//     }
//   }, [score, difficulty, leaderboard, playGameOver]);

//   const handleTap = useCallback(
//     color => {
//       if (gameOver) {
//         return;
//       }
//       if (color === targetColor) {
//         setScore(s => s + 1);
//         playCorrect();
//         pickRandomColor();
//       } else {
//         playWrong();
//         setScore(s => Math.max(0, s - 1));
//         setTimeLeft(t => Math.max(0, t - 2));
//       }
//     },
//     [gameOver, targetColor, playCorrect, playWrong, pickRandomColor],
//   );

//   const restart = useCallback(() => {
//     setScore(0);
//     setTimeLeft(INITIAL_TIME);
//     setGameOver(false);
//     pickRandomColor();
//   }, [pickRandomColor]);

//   const changeDifficulty = useCallback(
//     level => {
//       if (difficulty === level) {
//         return;
//       }
//       setDifficulty(level);
//       setScore(0);
//       setTimeLeft(INITIAL_TIME);
//       setGameOver(false);
//       pickRandomColor();
//     },
//     [difficulty, pickRandomColor],
//   );

//   useEffect(() => {
//     pickRandomColor();
//   }, [pickRandomColor]);

//   useEffect(() => {
//     const fraction = timeLeft / INITIAL_TIME;
//     Animated.timing(progressAnim, {
//       toValue: Math.max(0, fraction),
//       duration: 250,
//       easing: Easing.out(Easing.quad),
//       useNativeDriver: false,
//     }).start();
//   }, [timeLeft, progressAnim]);

//   useEffect(() => {
//     if (gameOver) {
//       return;
//     }
//     if (timeLeft <= 8) {
//       const pulse = Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 350,
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnim, {
//             toValue: 0,
//             duration: 350,
//             useNativeDriver: true,
//           }),
//         ]),
//       );
//       pulse.start();
//       return () => pulse.stop();
//     }
//   }, [timeLeft, gameOver, pulseAnim]);

//   useEffect(() => {
//     if (gameOver) {
//       return;
//     }
//     if (timeLeft <= 0) {
//       finishGame();
//       return;
//     }
//     const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
//     return () => clearTimeout(t);
//   }, [timeLeft, gameOver, finishGame]);

//   useEffect(() => {
//     (async () => {
//       try {
//         const raw = await AsyncStorage.getItem('@ttc_leaderboard');
//         setLeaderboard(raw ? JSON.parse(raw) : []);
//       } catch (e) {
//         console.log('Leaderboard load error:', e);
//       }
//     })();
//   }, []);

//   const barWidth = progressAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0%', '100%'],
//   });
//   const pulseScale = pulseAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [1, 1.08],
//   });

//   return (
//     <View style={styles.screen}>
//       <View style={styles.card}>
//         <View style={styles.headerRow}>
//           <Text style={styles.title}>🎯 Tap The Color</Text>
//           <View style={styles.scoreBadge}>
//             <Text style={styles.scoreText}>⭐ {score}</Text>
//           </View>
//         </View>

//         <View style={styles.progressWrap}>
//           <Animated.View style={[styles.progressFill, { width: barWidth }]} />
//         </View>
//         <Animated.Text
//           style={[
//             styles.timerText,
//             timeLeft <= 8 && {
//               color: '#ff3b30',
//               transform: [{ scale: pulseScale }],
//             },
//           ]}
//         >
//           ⏳ {timeLeft}s
//         </Animated.Text>

//         <View style={styles.targetPill}>
//           <Text style={styles.targetLabel}>Tap</Text>
//           <View
//             style={[styles.targetSwatch, { backgroundColor: targetColor }]}
//           />
//           <Text style={styles.targetValue}>{targetColor.toUpperCase()}</Text>
//         </View>

//         <View style={styles.grid}>
//           {colors[difficulty].map(c => (
//             <ScaleTile key={c} color={c} onPress={() => handleTap(c)} />
//           ))}
//         </View>

//         <View style={styles.diffRow}>
//           {['easy', 'medium', 'hard'].map(lvl => (
//             <TouchableOpacity
//               key={lvl}
//               onPress={() => changeDifficulty(lvl)}
//               style={[
//                 styles.diffChip,
//                 difficulty === lvl && styles.diffChipActive,
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.diffText,
//                   difficulty === lvl && styles.diffTextActive,
//                 ]}
//               >
//                 {lvl.toUpperCase()}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <View style={styles.bottomRow}>
//           <TouchableOpacity style={styles.secondaryBtn} onPress={restart}>
//             <Text style={styles.secondaryTxt}>Restart</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.primaryBtn} onPress={finishGame}>
//             <Text style={styles.primaryTxt}>End Game</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <View style={styles.lbCard}>
//         <Text style={styles.lbTitle}>🏆 ScoreBoard</Text>
//         {leaderboard.length === 0 ? (
//           <Text style={styles.lbEmpty}>Play to set your first high score!</Text>
//         ) : (
//           leaderboard.map((e, i) => (
//             <View key={`${e.date}-${i}`} style={styles.lbRow}>
//               <Text style={styles.lbRank}>{i + 1}.</Text>
//               <Text style={styles.lbScore}>{e.score} pts</Text>
//               <Text style={styles.lbDiff}>{e.difficulty}</Text>
//               <Text style={styles.lbDate}>{e.date}</Text>
//             </View>
//           ))
//         )}
//         <View style={{ height: 8 }} />
//         <TouchableOpacity
//           style={styles.ghostBtn}
//           onPress={async () => {
//             await AsyncStorage.removeItem('@ttc_leaderboard');
//             setLeaderboard([]);
//           }}
//         >
//           <Text style={styles.ghostTxt}>Clear Leaderboard</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// /* ---------------------------- Animated Tile Btn ---------------------------- */
// const ScaleTile = ({ color, onPress }) => {
//   const s = useRef(new Animated.Value(1)).current;
//   const pressIn = useCallback(() => {
//     Animated.spring(s, { toValue: 0.93, useNativeDriver: true }).start();
//   }, [s]);
//   const pressOut = useCallback(() => {
//     Animated.spring(s, {
//       toValue: 1,
//       friction: 4,
//       tension: 200,
//       useNativeDriver: true,
//     }).start(() => onPress());
//   }, [s, onPress]);
//   return (
//     <Animated.View style={[styles.tileWrap, { transform: [{ scale: s }] }]}>
//       <TouchableOpacity
//         activeOpacity={0.85}
//         onPressIn={pressIn}
//         onPressOut={pressOut}
//         style={[styles.tile, { backgroundColor: color }]}
//       />
//     </Animated.View>
//   );
// };

// /* --------------------------------- STYLES --------------------------------- */
// const styles = StyleSheet.create({
//   bottomRow: {
//     flexDirection: 'row',
//     gap: 10,
//     justifyContent: 'space-between',
//     marginTop: 14,
//   },
//   card: {
//     backgroundColor: '#171a2b',
//     borderRadius: 16,
//     elevation: 8,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.25,
//     shadowRadius: 12,
//   },
//   diffChip: {
//     backgroundColor: '#222742',
//     borderColor: '#2f3560',
//     borderRadius: 999,
//     borderWidth: 1,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
//   diffChipActive: {
//     backgroundColor: '#3b4180',
//     borderColor: '#5862e3',
//   },
//   diffRow: {
//     flexDirection: 'row',
//     gap: 8,
//     justifyContent: 'center',
//     marginTop: 12,
//   },
//   diffText: { color: '#b8c0ff', fontSize: 12, fontWeight: '700' },

//   diffTextActive: { color: '#ffffff' },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     marginTop: 14,
//   },
//   headerRow: {
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },

//   lbCard: {
//     backgroundColor: '#171a2b',
//     borderRadius: 16,
//     elevation: 6,
//     marginTop: 14,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.2,
//     shadowRadius: 10,
//   },
//   lbDate: { color: '#aeb6da', flex: 1, fontSize: 12, textAlign: 'right' },
//   lbDiff: {
//     color: '#ffd666',
//     fontSize: 12,
//     fontWeight: '700',
//     textTransform: 'uppercase',
//     width: 70,
//   },
//   lbEmpty: { color: '#9aa3c7' },

//   lbRank: { color: '#cbd4ff', fontWeight: '700', width: 22 },
//   lbRow: {
//     alignItems: 'center',
//     flexDirection: 'row',
//     gap: 8,
//     paddingVertical: 4,
//   },
//   lbScore: { color: '#ffffff', fontWeight: '800', width: 70 },

//   lbTitle: {
//     color: '#ffffff',
//     fontSize: 18,
//     fontWeight: '800',
//     marginBottom: 8,
//   },
//   primaryBtn: {
//     alignItems: 'center',
//     backgroundColor: '#5862e3',
//     borderRadius: 12,
//     flex: 1,
//     paddingVertical: 12,
//   },
//   primaryTxt: { color: '#fff', fontWeight: '800' },
//   progressFill: {
//     backgroundColor: '#21d07a',
//     borderRadius: 8,
//     height: '100%',
//   },
//   progressWrap: {
//     backgroundColor: '#2a2f55',
//     borderRadius: 8,
//     height: 8,
//     marginTop: 14,
//     overflow: 'hidden',
//   },

//   scoreBadge: {
//     backgroundColor: '#232848',
//     borderRadius: 999,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   scoreText: { color: '#fff', fontWeight: '700' },
//   screen: {
//     backgroundColor: '#0f1220',
//     flex: 1,
//     padding: 16,
//   },
//   secondaryBtn: {
//     alignItems: 'center',
//     borderColor: '#3c436e',
//     borderRadius: 12,
//     borderWidth: 1,
//     flex: 1,
//     paddingVertical: 12,
//   },
//   secondaryTxt: { color: '#d4dcff', fontWeight: '700' },

//   targetLabel: { color: '#b8c0ff', fontWeight: '600' },
//   targetPill: {
//     alignItems: 'center',
//     alignSelf: 'center',
//     backgroundColor: '#232848',
//     borderRadius: 999,
//     flexDirection: 'row',
//     gap: 8,
//     marginTop: 14,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//   },
//   targetSwatch: { borderRadius: 4, height: 16, width: 16 },
//   targetValue: { color: '#fff', fontWeight: '800', letterSpacing: 1 },
//   tile: {
//     borderRadius: 16,
//     height: 88,
//     width: 88,
//     ...Platform.select({
//       android: { elevation: 4 },
//       ios: {
//         shadowColor: '#000',
//         shadowOpacity: 0.25,
//         shadowRadius: 8,
//         shadowOffset: { width: 0, height: 4 },
//       },
//     }),
//   },
//   tileWrap: { margin: 10 },
//   timerText: {
//     alignSelf: 'center',
//     color: '#c8ffdf',
//     fontSize: 18,
//     fontWeight: '800',
//     marginTop: 8,
//   },
//   title: { color: '#ffffff', fontSize: 22, fontWeight: '700' },
// });
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
  ScrollView,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

/* ------------------------ SOUND HOOK (safe helper) ------------------------ */
const useGameSounds = () => {
  const correctRef = useRef(null);
  const wrongRef = useRef(null);
  const overRef = useRef(null);

  useEffect(() => {
    correctRef.current = new Sound('correct.mp3', Sound.MAIN_BUNDLE, e => {
      if (!e) {
        correctRef.current.setVolume(0.9);
      }
    });
    wrongRef.current = new Sound('wrong.mp3', Sound.MAIN_BUNDLE, e => {
      if (!e) {
        wrongRef.current.setVolume(0.9);
      }
    });
    overRef.current = new Sound('gameover.mp3', Sound.MAIN_BUNDLE, e => {
      if (!e) {
        overRef.current.setVolume(0.9);
      }
    });

    return () => {
      correctRef.current?.release();
      wrongRef.current?.release();
      overRef.current?.release();
    };
  }, []);

  const play = useCallback(ref => {
    const s = ref.current;
    if (!s) {
      return;
    }
    if (!s.isLoaded()) {
      setTimeout(() => s.isLoaded() && s.play(() => s.setCurrentTime(0)), 80);
      return;
    }
    s.setCurrentTime(0);
    s.play(() => s.setCurrentTime(0));
  }, []);

  return useMemo(
    () => ({
      playCorrect: () => play(correctRef),
      playWrong: () => play(wrongRef),
      playGameOver: () => play(overRef),
    }),
    [play],
  );
};

/* ---------------------------- Animated Tile Btn ---------------------------- */
const ScaleTile = ({ color, name, onPress, tileSize }) => {
  const s = useRef(new Animated.Value(1)).current;
  const pressIn = useCallback(() => {
    Animated.spring(s, { toValue: 0.93, useNativeDriver: true }).start();
  }, [s]);
  const pressOut = useCallback(() => {
    Animated.spring(s, {
      toValue: 1,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start(() => onPress());
  }, [s, onPress]);

  return (
    <Animated.View style={[styles.tileWrap, { transform: [{ scale: s }] }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[
          styles.tile,
          { backgroundColor: color, width: tileSize, height: tileSize },
          Platform.OS === 'ios' && styles.tileIOSShadow,
          Platform.OS === 'android' && styles.tileAndroidShadow,
        ]}
      />
      <Text style={styles.colorName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.colorCode} numberOfLines={1}>
        {color}
      </Text>
    </Animated.View>
  );
};

/* ------------------------------- MAIN SCREEN ------------------------------- */
export default function TapTheColorScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const INITIAL_TIME = 30;

  const [targetColor, setTargetColor] = useState('red');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [difficulty, setDifficulty] = useState('easy');

  const { playCorrect, playWrong, playGameOver } = useGameSounds();

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  // Responsive calculations
  const tileSize = useMemo(() => {
    if (isLandscape) {
      return Math.min(90, (width - 100) / 4);
    }
    return Math.min(95, (width - 60) / 4);
  }, [width, isLandscape]);

  // Comprehensive color sets with names
  const colors = useMemo(
    () => ({
      easy: [
        { color: '#FF0000', name: 'Red' },
        { color: '#00FF00', name: 'Green' },
        { color: '#0000FF', name: 'Blue' },
        { color: '#FFFF00', name: 'Yellow' },
        { color: '#FF00FF', name: 'Magenta' },
        { color: '#00FFFF', name: 'Cyan' },
        { color: '#FFA500', name: 'Orange' },
        { color: '#800080', name: 'Purple' },
        { color: '#FFC0CB', name: 'Pink' },
        { color: '#A52A2A', name: 'Brown' },
        { color: '#000000', name: 'Black' },
        { color: '#FFFFFF', name: 'White' },
        { color: '#808080', name: 'Gray' },
        { color: '#C0C0C0', name: 'Silver' },
        { color: '#FFD700', name: 'Gold' },
      ],
      medium: [
        // All easy colors plus these
        { color: '#FF0000', name: 'Red' },
        { color: '#00FF00', name: 'Green' },
        { color: '#0000FF', name: 'Blue' },
        { color: '#FFFF00', name: 'Yellow' },
        { color: '#FF00FF', name: 'Magenta' },
        { color: '#00FFFF', name: 'Cyan' },
        { color: '#FFA500', name: 'Orange' },
        { color: '#800080', name: 'Purple' },
        { color: '#FFC0CB', name: 'Pink' },
        { color: '#A52A2A', name: 'Brown' },
        { color: '#000000', name: 'Black' },
        { color: '#FFFFFF', name: 'White' },
        { color: '#808080', name: 'Gray' },
        { color: '#C0C0C0', name: 'Silver' },
        { color: '#FFD700', name: 'Gold' },

        // Medium level additions
        { color: '#8B4513', name: 'Saddle Brown' },
        { color: '#2E8B57', name: 'Sea Green' },
        { color: '#DC143C', name: 'Crimson' },
        { color: '#008080', name: 'Teal' },
        { color: '#9400D3', name: 'Dark Violet' },
        { color: '#FF4500', name: 'Orange Red' },
        { color: '#DA70D6', name: 'Orchid' },
        { color: '#696969', name: 'Dim Gray' },
        { color: '#1E90FF', name: 'Dodger Blue' },
        { color: '#FF1493', name: 'Deep Pink' },
        { color: '#32CD32', name: 'Lime Green' },
        { color: '#8A2BE2', name: 'Blue Violet' },
        { color: '#FF69B4', name: 'Hot Pink' },
        { color: '#CD5C5C', name: 'Indian Red' },
        { color: '#4B0082', name: 'Indigo' },
      ],
      hard: [
        // All colors from easy and medium plus these advanced colors
        { color: '#FF0000', name: 'Red' },
        { color: '#00FF00', name: 'Green' },
        { color: '#0000FF', name: 'Blue' },
        { color: '#FFFF00', name: 'Yellow' },
        { color: '#FF00FF', name: 'Magenta' },
        { color: '#00FFFF', name: 'Cyan' },
        { color: '#FFA500', name: 'Orange' },
        { color: '#800080', name: 'Purple' },
        { color: '#FFC0CB', name: 'Pink' },
        { color: '#A52A2A', name: 'Brown' },
        { color: '#000000', name: 'Black' },
        { color: '#FFFFFF', name: 'White' },
        { color: '#808080', name: 'Gray' },
        { color: '#C0C0C0', name: 'Silver' },
        { color: '#FFD700', name: 'Gold' },
        { color: '#8B4513', name: 'Saddle Brown' },
        { color: '#2E8B57', name: 'Sea Green' },
        { color: '#DC143C', name: 'Crimson' },
        { color: '#008080', name: 'Teal' },
        { color: '#9400D3', name: 'Dark Violet' },
        { color: '#FF4500', name: 'Orange Red' },
        { color: '#DA70D6', name: 'Orchid' },
        { color: '#696969', name: 'Dim Gray' },
        { color: '#1E90FF', name: 'Dodger Blue' },
        { color: '#FF1493', name: 'Deep Pink' },
        { color: '#32CD32', name: 'Lime Green' },
        { color: '#8A2BE2', name: 'Blue Violet' },
        { color: '#FF69B4', name: 'Hot Pink' },
        { color: '#CD5C5C', name: 'Indian Red' },
        { color: '#4B0082', name: 'Indigo' },

        // Advanced colors for hard level
        { color: '#F0F8FF', name: 'Alice Blue' },
        { color: '#FAEBD7', name: 'Antique White' },
        { color: '#7FFFD4', name: 'Aquamarine' },
        { color: '#F0FFFF', name: 'Azure' },
        { color: '#F5F5DC', name: 'Beige' },
        { color: '#FFE4C4', name: 'Bisque' },
        { color: '#FFEBCD', name: 'Blanched Almond' },
        { color: '#8A2BE2', name: 'Blue Violet' },
        { color: '#DEB887', name: 'Burly Wood' },
        { color: '#5F9EA0', name: 'Cadet Blue' },
        { color: '#D2691E', name: 'Chocolate' },
        { color: '#FF7F50', name: 'Coral' },
        { color: '#6495ED', name: 'Cornflower Blue' },
        { color: '#FFF8DC', name: 'Cornsilk' },
        { color: '#DAA520', name: 'Goldenrod' },
        { color: '#ADFF2F', name: 'Green Yellow' },
        { color: '#F0E68C', name: 'Khaki' },
        { color: '#E6E6FA', name: 'Lavender' },
        { color: '#FFF0F5', name: 'Lavender Blush' },
        { color: '#7CFC00', name: 'Lawn Green' },
        { color: '#FFFACD', name: 'Lemon Chiffon' },
        { color: '#ADD8E6', name: 'Light Blue' },
        { color: '#F08080', name: 'Light Coral' },
        { color: '#E0FFFF', name: 'Light Cyan' },
        { color: '#FAFAD2', name: 'Light Goldenrod' },
        { color: '#D3D3D3', name: 'Light Gray' },
        { color: '#90EE90', name: 'Light Green' },
        { color: '#FFB6C1', name: 'Light Pink' },
        { color: '#FFA07A', name: 'Light Salmon' },
        { color: '#20B2AA', name: 'Light Sea Green' },
        { color: '#87CEFA', name: 'Light Sky Blue' },
        { color: '#778899', name: 'Light Slate Gray' },
        { color: '#B0C4DE', name: 'Light Steel Blue' },
        { color: '#FFFFE0', name: 'Light Yellow' },
        { color: '#00FA9A', name: 'Medium Spring Green' },
        { color: '#48D1CC', name: 'Medium Turquoise' },
        { color: '#C71585', name: 'Medium Violet Red' },
        { color: '#191970', name: 'Midnight Blue' },
        { color: '#F5FFFA', name: 'Mint Cream' },
        { color: '#FFE4E1', name: 'Misty Rose' },
        { color: '#FFDEAD', name: 'Navajo White' },
        { color: '#FDF5E6', name: 'Old Lace' },
        { color: '#6B8E23', name: 'Olive Drab' },
        { color: '#FFA500', name: 'Orange' },
        { color: '#FFEFD5', name: 'Papaya Whip' },
        { color: '#FFDAB9', name: 'Peach Puff' },
        { color: '#CD853F', name: 'Peru' },
        { color: '#DDA0DD', name: 'Plum' },
        { color: '#B0E0E6', name: 'Powder Blue' },
        { color: '#BC8F8F', name: 'Rosy Brown' },
        { color: '#4169E1', name: 'Royal Blue' },
        { color: '#8B4513', name: 'Saddle Brown' },
        { color: '#FA8072', name: 'Salmon' },
        { color: '#F4A460', name: 'Sandy Brown' },
        { color: '#2E8B57', name: 'Sea Green' },
        { color: '#FFF5EE', name: 'Seashell' },
        { color: '#A0522D', name: 'Sienna' },
        { color: '#87CEEB', name: 'Sky Blue' },
        { color: '#6A5ACD', name: 'Slate Blue' },
        { color: '#708090', name: 'Slate Gray' },
        { color: '#FFFAFA', name: 'Snow' },
        { color: '#00FF7F', name: 'Spring Green' },
        { color: '#D2B48C', name: 'Tan' },
        { color: '#008080', name: 'Teal' },
        { color: '#D8BFD8', name: 'Thistle' },
        { color: '#FF6347', name: 'Tomato' },
        { color: '#40E0D0', name: 'Turquoise' },
        { color: '#EE82EE', name: 'Violet' },
        { color: '#F5DEB3', name: 'Wheat' },
        { color: '#9ACD32', name: 'Yellow Green' },
      ],
    }),
    [],
  );

  // Extract just color values for target selection
  const colorValues = useMemo(
    () => ({
      easy: colors.easy.map(c => c.color),
      medium: colors.medium.map(c => c.color),
      hard: colors.hard.map(c => c.color),
    }),
    [colors],
  );

  const pickRandomColor = useCallback(() => {
    const set = colorValues[difficulty];
    const randomColor = set[Math.floor(Math.random() * set.length)];
    setTargetColor(randomColor);
  }, [colorValues, difficulty]);

  const finishGame = useCallback(async () => {
    setGameOver(true);
    playGameOver();

    try {
      const entry = { score, difficulty, date: new Date().toLocaleString() };
      const updated = [...leaderboard, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setLeaderboard(updated);
      await AsyncStorage.setItem('@ttc_leaderboard', JSON.stringify(updated));
    } catch (e) {
      console.log('Leaderboard save error:', e);
    }
  }, [score, difficulty, leaderboard, playGameOver]);

  const handleTap = useCallback(
    color => {
      if (gameOver) {
        return;
      }
      if (color === targetColor) {
        setScore(s => s + 1);
        playCorrect();
        pickRandomColor();
      } else {
        playWrong();
        setScore(s => Math.max(0, s - 1));
        setTimeLeft(t => Math.max(0, t - 2));
      }
    },
    [gameOver, targetColor, playCorrect, playWrong, pickRandomColor],
  );

  const restart = useCallback(() => {
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setGameOver(false);
    pickRandomColor();
  }, [pickRandomColor]);

  const changeDifficulty = useCallback(
    level => {
      if (difficulty === level) {
        return;
      }
      setDifficulty(level);
      setScore(0);
      setTimeLeft(INITIAL_TIME);
      setGameOver(false);
      pickRandomColor();
    },
    [difficulty, pickRandomColor],
  );

  useEffect(() => {
    pickRandomColor();
  }, [pickRandomColor]);

  useEffect(() => {
    const fraction = timeLeft / INITIAL_TIME;
    Animated.timing(progressAnim, {
      toValue: Math.max(0, fraction),
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [timeLeft, progressAnim]);

  useEffect(() => {
    if (gameOver) {
      return;
    }
    if (timeLeft <= 8) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [timeLeft, gameOver, pulseAnim]);

  useEffect(() => {
    if (gameOver) {
      return;
    }
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver, finishGame]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@ttc_leaderboard');
        setLeaderboard(raw ? JSON.parse(raw) : []);
      } catch (e) {
        console.log('Leaderboard load error:', e);
      }
    })();
  }, []);

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  // Find the current target color name
  const currentTargetColor = useMemo(() => {
    const allColors = [...colors.easy, ...colors.medium, ...colors.hard];
    const found = allColors.find(
      c => c.color.toLowerCase() === targetColor.toLowerCase(),
    );
    return found || { color: targetColor, name: targetColor };
  }, [targetColor, colors]);

  return (
    <View style={[styles.screen, isLandscape && styles.screenLandscape]}>
      <View style={[styles.card, isLandscape && styles.cardLandscape]}>
        <View
          style={[styles.headerRow, isLandscape && styles.headerRowLandscape]}
        >
          <Text style={[styles.title, isLandscape && styles.titleLandscape]}>
            🎯 Tap The Color
          </Text>
          <View
            style={[
              styles.scoreBadge,
              isLandscape && styles.scoreBadgeLandscape,
            ]}
          >
            <Text
              style={[
                styles.scoreText,
                isLandscape && styles.scoreTextLandscape,
              ]}
            >
              ⭐ {score}
            </Text>
          </View>
        </View>

        {/* Combined Timer and Target Color in one line */}
        <View
          style={[
            styles.combinedInfoRow,
            isLandscape && styles.combinedInfoRowLandscape,
          ]}
        >
          <View style={styles.timerSection}>
            <View
              style={[
                styles.progressWrap,
                isLandscape && styles.progressWrapLandscape,
              ]}
            >
              <Animated.View
                style={[styles.progressFill, { width: barWidth }]}
              />
            </View>
            <Animated.Text
              style={[
                styles.timerText,
                timeLeft <= 8 && {
                  color: '#ff3b30',
                  transform: [{ scale: pulseScale }],
                },
                isLandscape && styles.timerTextLandscape,
              ]}
            >
              ⏳ {timeLeft}s
            </Animated.Text>
          </View>

          <View
            style={[
              styles.targetPill,
              isLandscape && styles.targetPillLandscape,
            ]}
          >
            <Text
              style={[
                styles.targetLabel,
                isLandscape && styles.targetLabelLandscape,
              ]}
            >
              Tap:
            </Text>
            <View
              style={[styles.targetSwatch, { backgroundColor: targetColor }]}
            />
            <View style={styles.targetTextContainer}>
              <Text
                style={[
                  styles.targetName,
                  isLandscape && styles.targetNameLandscape,
                ]}
                numberOfLines={1}
              >
                {currentTargetColor.name}
              </Text>
              <Text
                style={[
                  styles.targetValue,
                  isLandscape && styles.targetValueLandscape,
                ]}
                numberOfLines={1}
              >
                {targetColor.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Scrollable Color Grid */}
        <ScrollView
          style={[
            styles.gridScrollView,
            isLandscape && styles.gridScrollViewLandscape,
          ]}
          showsVerticalScrollIndicator={true}
        >
          <View style={[styles.grid, isLandscape && styles.gridLandscape]}>
            {colors[difficulty].map((c, index) => (
              <ScaleTile
                key={`${c.color}-${index}`}
                color={c.color}
                name={c.name}
                tileSize={tileSize}
                onPress={() => handleTap(c.color)}
              />
            ))}
          </View>
        </ScrollView>

        <View style={[styles.diffRow, isLandscape && styles.diffRowLandscape]}>
          {['easy', 'medium', 'hard'].map(lvl => (
            <TouchableOpacity
              key={lvl}
              onPress={() => changeDifficulty(lvl)}
              style={[
                styles.diffChip,
                difficulty === lvl && styles.diffChipActive,
                isLandscape && styles.diffChipLandscape,
              ]}
            >
              <Text
                style={[
                  styles.diffText,
                  difficulty === lvl && styles.diffTextActive,
                  isLandscape && styles.diffTextLandscape,
                ]}
              >
                {lvl.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={[styles.bottomRow, isLandscape && styles.bottomRowLandscape]}
        >
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              isLandscape && styles.secondaryBtnLandscape,
            ]}
            onPress={restart}
          >
            <Text
              style={[
                styles.secondaryTxt,
                isLandscape && styles.secondaryTxtLandscape,
              ]}
            >
              Restart
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              isLandscape && styles.primaryBtnLandscape,
            ]}
            onPress={finishGame}
          >
            <Text
              style={[
                styles.primaryTxt,
                isLandscape && styles.primaryTxtLandscape,
              ]}
            >
              End Game
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.lbCard, isLandscape && styles.lbCardLandscape]}>
        <Text style={[styles.lbTitle, isLandscape && styles.lbTitleLandscape]}>
          🏆 ScoreBoard
        </Text>
        {leaderboard.length === 0 ? (
          <Text
            style={[styles.lbEmpty, isLandscape && styles.lbEmptyLandscape]}
          >
            Play to set your first high score!
          </Text>
        ) : (
          leaderboard.map((e, i) => (
            <View
              key={`${e.date}-${i}`}
              style={[styles.lbRow, isLandscape && styles.lbRowLandscape]}
            >
              <Text
                style={[styles.lbRank, isLandscape && styles.lbRankLandscape]}
              >
                {i + 1}.
              </Text>
              <Text
                style={[styles.lbScore, isLandscape && styles.lbScoreLandscape]}
              >
                {e.score} pts
              </Text>
              <Text
                style={[styles.lbDiff, isLandscape && styles.lbDiffLandscape]}
              >
                {e.difficulty}
              </Text>
              <Text
                style={[styles.lbDate, isLandscape && styles.lbDateLandscape]}
              >
                {e.date}
              </Text>
            </View>
          ))
        )}
        <View style={{ height: 8 }} />
        <TouchableOpacity
          style={[styles.ghostBtn, isLandscape && styles.ghostBtnLandscape]}
          onPress={async () => {
            await AsyncStorage.removeItem('@ttc_leaderboard');
            setLeaderboard([]);
          }}
        >
          <Text
            style={[styles.ghostTxt, isLandscape && styles.ghostTxtLandscape]}
          >
            Clear Leaderboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* --------------------------------- STYLES --------------------------------- */
const styles = StyleSheet.create({
  // ========== BASE STYLES ==========
  screen: {
    backgroundColor: '#0f1220',
    flex: 1,
    padding: 16,
  },
  screenLandscape: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },

  card: {
    backgroundColor: '#171a2b',
    borderRadius: 16,
    elevation: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  cardLandscape: {
    flex: 1,
    padding: 14,
  },

  // ========== HEADER ==========
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerRowLandscape: {
    marginBottom: 6,
  },

  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  titleLandscape: {
    fontSize: 20,
  },

  scoreBadge: {
    backgroundColor: '#232848',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scoreBadgeLandscape: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  scoreText: {
    color: '#fff',
    fontWeight: '700',
  },
  scoreTextLandscape: {
    fontSize: 14,
  },

  // ========== COMBINED TIMER & TARGET ROW ==========
  combinedInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  combinedInfoRowLandscape: {
    marginTop: 10,
  },

  timerSection: {
    flex: 1,
    marginRight: 12,
  },

  // ========== PROGRESS BAR ==========
  progressWrap: {
    backgroundColor: '#2a2f55',
    borderRadius: 8,
    height: 8,
    overflow: 'hidden',
  },
  progressWrapLandscape: {
    height: 6,
  },

  progressFill: {
    backgroundColor: '#21d07a',
    borderRadius: 8,
    height: '100%',
  },

  // ========== TIMER ==========
  timerText: {
    color: '#c8ffdf',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  timerTextLandscape: {
    fontSize: 16,
    marginTop: 3,
  },

  // ========== TARGET COLOR ==========
  targetPill: {
    alignItems: 'center',
    backgroundColor: '#232848',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flex: 1.5,
  },
  targetPillLandscape: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  targetLabel: {
    color: '#b8c0ff',
    fontWeight: '600',
    fontSize: 12,
  },
  targetLabelLandscape: {
    fontSize: 11,
  },

  targetSwatch: {
    borderRadius: 4,
    height: 20,
    width: 20,
  },
  targetSwatchLandscape: {
    height: 18,
    width: 18,
  },

  targetTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },

  targetName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  targetNameLandscape: {
    fontSize: 11,
  },

  targetValue: {
    color: '#d4dcff',
    fontSize: 10,
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  targetValueLandscape: {
    fontSize: 9,
  },

  // ========== SCROLLABLE COLOR GRID ==========
  gridScrollView: {
    maxHeight: 300,
    marginTop: 14,
  },
  gridScrollViewLandscape: {
    maxHeight: 250,
    marginTop: 10,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  gridLandscape: {
    paddingBottom: 8,
  },

  tileWrap: {
    margin: 6,
    alignItems: 'center',
    width: 95,
  },
  tileWrapLandscape: {
    margin: 4,
    width: 90,
  },

  tile: {
    borderRadius: 12,
  },
  tileIOSShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  tileAndroidShadow: {
    elevation: 4,
  },

  colorName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
  },

  colorCode: {
    color: '#b8c0ff',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
    opacity: 0.8,
  },

  // ========== DIFFICULTY SELECTOR ==========
  diffRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
  },
  diffRowLandscape: {
    marginTop: 8,
    gap: 6,
  },

  diffChip: {
    backgroundColor: '#222742',
    borderColor: '#2f3560',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  diffChipLandscape: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  diffChipActive: {
    backgroundColor: '#3b4180',
    borderColor: '#5862e3',
  },

  diffText: {
    color: '#b8c0ff',
    fontSize: 12,
    fontWeight: '700',
  },
  diffTextLandscape: {
    fontSize: 11,
  },

  diffTextActive: {
    color: '#ffffff',
  },

  // ========== ACTION BUTTONS ==========
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 14,
  },
  bottomRowLandscape: {
    marginTop: 10,
    gap: 8,
  },

  secondaryBtn: {
    alignItems: 'center',
    borderColor: '#3c436e',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  secondaryBtnLandscape: {
    paddingVertical: 10,
  },

  secondaryTxt: {
    color: '#d4dcff',
    fontWeight: '700',
  },
  secondaryTxtLandscape: {
    fontSize: 13,
  },

  primaryBtn: {
    alignItems: 'center',
    backgroundColor: '#5862e3',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  primaryBtnLandscape: {
    paddingVertical: 10,
  },

  primaryTxt: {
    color: '#fff',
    fontWeight: '800',
  },
  primaryTxtLandscape: {
    fontSize: 13,
  },

  // ========== LEADERBOARD ==========
  lbCard: {
    backgroundColor: '#171a2b',
    borderRadius: 16,
    elevation: 6,
    marginTop: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  lbCardLandscape: {
    flex: 1,
    marginTop: 0,
    padding: 14,
  },

  lbTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  lbTitleLandscape: {
    fontSize: 16,
    marginBottom: 6,
  },

  lbEmpty: {
    color: '#9aa3c7',
  },
  lbEmptyLandscape: {
    fontSize: 13,
  },

  lbRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  lbRowLandscape: {
    paddingVertical: 3,
    gap: 6,
  },

  lbRank: {
    color: '#cbd4ff',
    fontWeight: '700',
    width: 22,
  },
  lbRankLandscape: {
    width: 20,
    fontSize: 13,
  },

  lbScore: {
    color: '#ffffff',
    fontWeight: '800',
    width: 70,
  },
  lbScoreLandscape: {
    width: 60,
    fontSize: 13,
  },

  lbDiff: {
    color: '#ffd666',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    width: 70,
  },
  lbDiffLandscape: {
    width: 60,
    fontSize: 11,
  },

  lbDate: {
    color: '#aeb6da',
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
  },
  lbDateLandscape: {
    fontSize: 11,
  },

  // ========== CLEAR BUTTON ==========
  ghostBtn: {
    alignItems: 'center',
    borderColor: '#3c436e',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
  },
  ghostBtnLandscape: {
    paddingVertical: 6,
  },

  ghostTxt: {
    color: '#ff6b6b',
    fontSize: 12,
  },
  ghostTxtLandscape: {
    fontSize: 11,
  },
});
