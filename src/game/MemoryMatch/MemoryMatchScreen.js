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
//   Dimensions,
//   Platform,
// } from 'react-native';
// import Sound from 'react-native-sound';
// // import Sound from 'react-native-sound-media';

// Sound.setCategory('Playback');

// const WINDOW = Dimensions.get('window');
// const BASE_CARD_SIZE = Math.floor(WINDOW.width / 4) - 18;
// const EMOJIS = [
//   '🍎',
//   '🍌',
//   '🍒',
//   '🍇',
//   '🍉',
//   '🍍',
//   '🥝',
//   '🥭',
//   '🍑',
//   '🥥',
//   '🍋',
//   '🍓',
//   '🥑',
//   '🍐',
//   '🍈',
//   '🍊',
//   '🥕',
//   '🌽',
// ];

// const makeShuffledCards = (rows, cols) => {
//   const pairCount = Math.floor((rows * cols) / 2);
//   const pool = EMOJIS.slice(0, pairCount);
//   const duplicated = [...pool, ...pool];
//   for (let i = duplicated.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]];
//   }
//   return duplicated.map((emoji, idx) => ({ id: `${idx}-${emoji}`, emoji }));
// };

// const useSounds = () => {
//   const refs = useRef({});

//   useEffect(() => {
//     const names = ['flip', 'correct', 'wrong', 'win'];
//     names.forEach(name => {
//       refs.current[name] = new Sound(`${name}.mp3`, Sound.MAIN_BUNDLE, e => {
//         if (!e) {
//           refs.current[name].setVolume(0.9);
//         }
//       });
//     });
//     return () => names.forEach(n => refs.current[n]?.release());
//   }, []);

//   const play = useCallback(name => {
//     const s = refs.current[name];
//     if (!s) {
//       return;
//     }
//     try {
//       s.setCurrentTime(0);
//       s.play();
//     } catch (err) {
//       console.log(`sound play err: ${name}`, err);
//     }
//   }, []);

//   return {
//     playFlip: () => play('flip'),
//     playCorrect: () => play('correct'),
//     playWrong: () => play('wrong'),
//     playWin: () => play('win'),
//   };
// };

// export default function MemoryMatchScreen() {
//   const [level, setLevel] = useState('easy');
//   const [rowsCols, setRowsCols] = useState({ rows: 4, cols: 4 });
//   const [cards, setCards] = useState([]);
//   const [flipped, setFlipped] = useState([]);
//   const [matched, setMatched] = useState([]);
//   const [moves, setMoves] = useState(0);
//   const [time, setTime] = useState(0);
//   const [busy, setBusy] = useState(false);

//   const timerRef = useRef(null);
//   const animsRef = useRef([]);
//   const sounds = useSounds();

//   useEffect(() => {
//     if (level === 'easy') {
//       setRowsCols({ rows: 4, cols: 4 });
//     } else if (level === 'medium') {
//       setRowsCols({ rows: 5, cols: 4 });
//     } else {
//       setRowsCols({ rows: 6, cols: 4 });
//     }
//   }, [level]);

//   const initGame = useCallback(() => {
//     const { rows, cols } = rowsCols;
//     const newCards = makeShuffledCards(rows, cols);
//     setCards(newCards);
//     setFlipped([]);
//     setMatched([]);
//     setMoves(0);
//     setTime(0);
//     setBusy(false);
//     animsRef.current = newCards.map(() => new Animated.Value(0));
//   }, [rowsCols]);

//   useEffect(() => {
//     initGame();
//   }, [initGame]);

//   useEffect(() => {
//     timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
//     return () => clearInterval(timerRef.current);
//   }, []);

//   const animateTo = useCallback((index, toValue, duration = 420) => {
//     return Animated.timing(animsRef.current[index], {
//       toValue,
//       duration,
//       useNativeDriver: true,
//     });
//   }, []);

//   const handleCardPress = useCallback(
//     index => {
//       if (busy || flipped.includes(index) || matched.includes(index)) {
//         return;
//       }
//       if (!animsRef.current[index]) {
//         return;
//       }
//       sounds.playFlip();
//       animateTo(index, 180).start();
//       const newFlipped = [...flipped, index];
//       setFlipped(newFlipped);

//       if (newFlipped.length === 2) {
//         setBusy(true);
//         setMoves(m => m + 1);
//         const [a, b] = newFlipped;
//         if (cards[a].emoji === cards[b].emoji) {
//           setTimeout(() => {
//             sounds.playCorrect();
//             setMatched(prev => [...prev, a, b]);
//             setFlipped([]);
//             setBusy(false);
//           }, 250);
//         } else {
//           setTimeout(() => {
//             sounds.playWrong();
//             animateTo(a, 0).start();
//             animateTo(b, 0).start(() => {
//               setFlipped([]);
//               setBusy(false);
//             });
//           }, 700);
//         }
//       }
//     },
//     [busy, flipped, matched, cards, sounds, animateTo],
//   );

//   useEffect(() => {
//     if (cards.length && matched.length === cards.length) {
//       sounds.playWin();
//       clearInterval(timerRef.current);
//     }
//   }, [matched, cards, sounds]);

//   const cardSize = useMemo(
//     () => Math.floor(BASE_CARD_SIZE * (rowsCols.cols > 4 ? 0.9 : 1)),
//     [rowsCols],
//   );

//   const score = useMemo(() => {
//     const pairs = Math.floor(cards.length / 2);
//     const matchedPairs = Math.floor(matched.length / 2);
//     const base = pairs * 100;
//     const timePenalty = Math.floor(time * 2);
//     const movesPenalty = Math.floor(Math.max(0, moves - pairs) * 8);
//     const rawScore = Math.max(0, base - timePenalty - movesPenalty);
//     return matchedPairs === pairs ? rawScore + 200 : rawScore;
//   }, [cards, matched, time, moves]);

//   const getCardTransform = i => {
//     const val = animsRef.current[i];
//     const rotateY = val.interpolate({
//       inputRange: [0, 180],
//       outputRange: ['0deg', '180deg'],
//     });
//     return { transform: [{ rotateY }] };
//   };

//   const getOpacity = (i, back = false) => {
//     const val = animsRef.current[i];
//     return val.interpolate({
//       inputRange: [89, 90],
//       outputRange: back ? [0, 1] : [1, 0],
//       extrapolate: 'clamp',
//     });
//   };

//   return (
//     <View style={styles.screen}>
//       <Text style={styles.title}>🧠 Memory Match</Text>

//       <View style={styles.row}>
//         <View style={styles.info}>
//           <Text style={styles.infoText}>Moves: {moves}</Text>
//           <Text style={styles.infoText}>Time: {time}s</Text>
//         </View>

//         <View style={styles.levels}>
//           {['easy', 'medium', 'hard'].map(lvl => (
//             <TouchableOpacity
//               key={lvl}
//               onPress={() => setLevel(lvl)}
//               style={[styles.levelBtn, level === lvl && styles.levelBtnActive]}
//             >
//               <Text
//                 style={[
//                   styles.levelTxt,
//                   level === lvl && styles.levelTxtActive,
//                 ]}
//               >
//                 {lvl.toUpperCase()}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       <View style={[styles.grid, { width: rowsCols.cols * (cardSize + 10) }]}>
//         {cards.map((c, i) => {
//           const isMatched = matched.includes(i);
//           const isFlipped = flipped.includes(i) || isMatched;
//           return (
//             <TouchableOpacity
//               activeOpacity={0.9}
//               key={c.id}
//               style={styles.cardWrapper}
//               onPress={() => handleCardPress(i)}
//               disabled={isMatched}
//             >
//               <View style={{ width: cardSize, height: cardSize }}>
//                 {/* FRONT */}
//                 <Animated.View
//                   style={[
//                     styles.card,
//                     getCardTransform(i),
//                     { opacity: getOpacity(i, false) },
//                   ]}
//                 >
//                   <Text style={styles.cardText}>❓</Text>
//                 </Animated.View>

//                 {/* BACK */}
//                 <Animated.View
//                   style={[
//                     styles.card,
//                     styles.cardBack,
//                     {
//                       transform: [
//                         {
//                           rotateY: animsRef.current[i].interpolate({
//                             inputRange: [0, 180],
//                             outputRange: ['180deg', '360deg'],
//                           }),
//                         },
//                       ],
//                       opacity: getOpacity(i, true),
//                     },
//                   ]}
//                 >
//                   <Text style={styles.cardText}>{c.emoji}</Text>
//                 </Animated.View>
//               </View>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       <View style={styles.footer}>
//         <TouchableOpacity style={styles.button} onPress={initGame}>
//           <Text style={styles.buttonText}>🔄 Restart</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.button, styles.revealBtn]}
//           onPress={() => {
//             cards.forEach((_, idx) => animateTo(idx, 180).start());
//             setMatched(cards.map((_, i) => i));
//             clearInterval(timerRef.current);
//             sounds.playWin();
//           }}
//         >
//           <Text style={styles.buttonText}>🎉 Reveal (test)</Text>
//         </TouchableOpacity>
//       </View>

//       {matched.length > 0 && matched.length === cards.length && (
//         <View style={styles.winBox}>
//           <Text style={styles.winText}>🎉 You Win!</Text>
//           <Text style={styles.winSub}>Score: {score}</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   button: {
//     backgroundColor: '#3b82f6',
//     borderRadius: 10,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   buttonText: { color: '#fff', fontWeight: '800' },
//   card: {
//     alignItems: 'center',
//     backfaceVisibility: 'hidden',
//     backgroundColor: '#1f2636',
//     borderRadius: 12,
//     elevation: 6,
//     height: '100%',
//     justifyContent: 'center',
//     position: 'absolute',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.4,
//     shadowRadius: 6,
//     width: '100%',
//   },
//   cardBack: { backgroundColor: '#2b7a78' },
//   cardText: { color: '#fff', fontSize: 28, fontWeight: '800' },
//   cardWrapper: { margin: 5 },
//   footer: { flexDirection: 'row', gap: 12, marginTop: 16 },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     marginTop: 8,
//   },
//   info: { flexDirection: 'row', gap: 12 },
//   infoText: { color: '#cfe8d1', fontWeight: '700' },
//   levelBtn: {
//     backgroundColor: '#1f2840',
//     borderRadius: 8,
//     marginLeft: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//   },
//   levelBtnActive: { backgroundColor: '#5862e3' },
//   levelTxt: { color: '#cfe8d1', fontWeight: '700' },
//   levelTxtActive: { color: '#fff' },
//   levels: { flexDirection: 'row' },
//   revealBtn: { backgroundColor: '#2ecc71' },
//   row: {
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//     width: '92%',
//   },
//   screen: {
//     alignItems: 'center',
//     backgroundColor: '#0f1724',
//     flex: 1,
//     paddingTop: Platform.OS === 'android' ? 28 : 44,
//   },
//   title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 8 },
//   winBox: {
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.08)',
//     borderRadius: 12,
//     padding: 12,
//     position: 'absolute',
//     top: 110,
//   },
//   winSub: { color: '#fff', fontWeight: '700', marginTop: 6 },
//   winText: { color: '#ffd166', fontSize: 20, fontWeight: '800' },
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
  useWindowDimensions,
  Platform,
  ScrollView,
} from 'react-native';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

const EMOJIS = [
  '🍎',
  '🍌',
  '🍒',
  '🍇',
  '🍉',
  '🍍',
  '🥝',
  '🥭',
  '🍑',
  '🥥',
  '🍋',
  '🍓',
  '🥑',
  '🍐',
  '🍈',
  '🍊',
  '🥕',
  '🌽',
  '🥦',
  '🍅',
  '🥔',
  '🥒',
  '🌶️',
  '🧅',
];

const makeShuffledCards = (rows, cols) => {
  const pairCount = Math.floor((rows * cols) / 2);
  const pool = EMOJIS.slice(0, pairCount);
  const duplicated = [...pool, ...pool];
  for (let i = duplicated.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]];
  }
  return duplicated.map((emoji, idx) => ({ id: `${idx}-${emoji}`, emoji }));
};

const useSounds = () => {
  const refs = useRef({});

  useEffect(() => {
    const names = ['flip', 'correct', 'wrong', 'win'];
    names.forEach(name => {
      refs.current[name] = new Sound(`${name}.mp3`, Sound.MAIN_BUNDLE, e => {
        if (!e) {
          refs.current[name].setVolume(0.9);
        }
      });
    });
    return () => names.forEach(n => refs.current[n]?.release());
  }, []);

  const play = useCallback(name => {
    const s = refs.current[name];
    if (!s) {
      return;
    }
    try {
      s.setCurrentTime(0);
      s.play();
    } catch (err) {
      console.log(`sound play err: ${name}`, err);
    }
  }, []);

  return {
    playFlip: () => play('flip'),
    playCorrect: () => play('correct'),
    playWrong: () => play('wrong'),
    playWin: () => play('win'),
  };
};

export default function MemoryMatchScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [level, setLevel] = useState('easy');
  const [rowsCols, setRowsCols] = useState({ rows: 4, cols: 4 });
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [busy, setBusy] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const timerRef = useRef(null);
  const animsRef = useRef([]);
  const sounds = useSounds();

  // Adjust grid configuration for landscape
  useEffect(() => {
    if (isLandscape) {
      // Landscape: fewer rows, more columns
      switch (level) {
        case 'easy':
          setRowsCols({ rows: 3, cols: 4 }); // 12 cards
          break;
        case 'medium':
          setRowsCols({ rows: 4, cols: 4 }); // 16 cards
          break;
        case 'hard':
          setRowsCols({ rows: 4, cols: 5 }); // 20 cards
          break;
      }
    } else {
      // Portrait: original configuration
      switch (level) {
        case 'easy':
          setRowsCols({ rows: 4, cols: 4 });
          break;
        case 'medium':
          setRowsCols({ rows: 5, cols: 4 });
          break;
        case 'hard':
          setRowsCols({ rows: 6, cols: 4 });
          break;
      }
    }
  }, [level, isLandscape]);

  // Calculate card size dynamically for both orientations
  const cardSize = useMemo(() => {
    const { rows, cols } = rowsCols;
    const spacing = 6;

    // Available width considering padding
    const availableWidth = width - 24; // Reduced padding for landscape

    // Available height calculation
    // Portrait: Header(80) + Info(40) + Buttons(80) + Padding(40) = 240px
    // Landscape: Header(60) + Info(30) + Buttons(70) + Padding(30) = 190px
    const headerHeight = isLandscape ? 60 : 80;
    const infoHeight = isLandscape ? 30 : 40;
    const buttonsHeight = isLandscape ? 70 : 80;
    const extraPadding = isLandscape ? 20 : 30;

    const availableHeight =
      height - (headerHeight + infoHeight + buttonsHeight + extraPadding);

    // Calculate based on width
    const widthCardSize = Math.floor(
      (availableWidth - spacing * (cols - 1)) / cols,
    );

    // Calculate based on height
    const heightCardSize = Math.floor(
      (availableHeight - spacing * (rows - 1)) / rows,
    );

    // Take the smaller one
    const calculatedSize = Math.min(widthCardSize, heightCardSize);

    // Apply scaling for different levels
    const levelScale = {
      easy: 1,
      medium: 0.95,
      hard: 0.9,
    };

    const scaledSize = Math.floor(calculatedSize * levelScale[level]);

    // Ensure minimum and maximum size
    return Math.max(50, Math.min(scaledSize, 100));
  }, [width, height, rowsCols, isLandscape, level]);

  const initGame = useCallback(() => {
    const { rows, cols } = rowsCols;
    const newCards = makeShuffledCards(rows, cols);
    setCards(newCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setBusy(false);
    setGameCompleted(false);
    animsRef.current = newCards.map(() => new Animated.Value(0));

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
  }, [rowsCols]);

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initGame]);

  const animateTo = useCallback((index, toValue, duration = 420) => {
    return Animated.timing(animsRef.current[index], {
      toValue,
      duration,
      useNativeDriver: true,
    });
  }, []);

  const handleCardPress = useCallback(
    index => {
      if (
        busy ||
        flipped.includes(index) ||
        matched.includes(index) ||
        gameCompleted
      ) {
        return;
      }
      if (!animsRef.current[index]) {
        return;
      }
      sounds.playFlip();
      animateTo(index, 180).start();
      const newFlipped = [...flipped, index];
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setBusy(true);
        setMoves(m => m + 1);
        const [a, b] = newFlipped;
        if (cards[a].emoji === cards[b].emoji) {
          setTimeout(() => {
            sounds.playCorrect();
            setMatched(prev => [...prev, a, b]);
            setFlipped([]);
            setBusy(false);
          }, 250);
        } else {
          setTimeout(() => {
            sounds.playWrong();
            animateTo(a, 0).start();
            animateTo(b, 0).start(() => {
              setFlipped([]);
              setBusy(false);
            });
          }, 700);
        }
      }
    },
    [busy, flipped, matched, cards, sounds, animateTo, gameCompleted],
  );

  useEffect(() => {
    if (cards.length && matched.length === cards.length) {
      setGameCompleted(true);
      sounds.playWin();
      clearInterval(timerRef.current);
    }
  }, [matched, cards, sounds]);

  const score = useMemo(() => {
    const pairs = Math.floor(cards.length / 2);
    const matchedPairs = Math.floor(matched.length / 2);
    const base = pairs * 100;
    const timePenalty = Math.floor(time * 2);
    const movesPenalty = Math.floor(Math.max(0, moves - pairs) * 8);
    const rawScore = Math.max(0, base - timePenalty - movesPenalty);
    return matchedPairs === pairs ? rawScore + 200 : rawScore;
  }, [cards, matched, time, moves]);

  const getCardTransform = i => {
    const val = animsRef.current[i];
    const rotateY = val.interpolate({
      inputRange: [0, 180],
      outputRange: ['0deg', '180deg'],
    });
    return { transform: [{ rotateY }] };
  };

  const getOpacity = (i, back = false) => {
    const val = animsRef.current[i];
    return val.interpolate({
      inputRange: [89, 90],
      outputRange: back ? [0, 1] : [1, 0],
      extrapolate: 'clamp',
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[styles.container, isLandscape && styles.containerLandscape]}
      >
        <Text style={[styles.title, isLandscape && styles.titleLandscape]}>
          🧠 Memory Match
        </Text>

        <View style={[styles.row, isLandscape && styles.rowLandscape]}>
          <View style={[styles.info, isLandscape && styles.infoLandscape]}>
            <Text
              style={[styles.infoText, isLandscape && styles.infoTextLandscape]}
            >
              Moves: {moves}
            </Text>
            <Text
              style={[styles.infoText, isLandscape && styles.infoTextLandscape]}
            >
              Time: {time}s
            </Text>
            <Text
              style={[styles.infoText, isLandscape && styles.infoTextLandscape]}
            >
              Score: {score}
            </Text>
          </View>

          <View style={[styles.levels, isLandscape && styles.levelsLandscape]}>
            {['easy', 'medium', 'hard'].map(lvl => (
              <TouchableOpacity
                key={lvl}
                onPress={() => setLevel(lvl)}
                style={[
                  styles.levelBtn,
                  level === lvl && styles.levelBtnActive,
                  isLandscape && styles.levelBtnLandscape,
                ]}
              >
                <Text
                  style={[
                    styles.levelTxt,
                    level === lvl && styles.levelTxtActive,
                    isLandscape && styles.levelTxtLandscape,
                  ]}
                >
                  {lvl.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.gridContainer,
            isLandscape && styles.gridContainerLandscape,
          ]}
        >
          <View
            style={[
              styles.grid,
              {
                width: rowsCols.cols * (cardSize + 8),
                maxWidth: '100%',
              },
            ]}
          >
            {cards.map((c, i) => {
              const isMatched = matched.includes(i);
              const isFlipped = flipped.includes(i) || isMatched;
              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  key={c.id}
                  style={[
                    styles.cardWrapper,
                    { width: cardSize, height: cardSize },
                  ]}
                  onPress={() => handleCardPress(i)}
                  disabled={isMatched}
                >
                  <View style={{ width: '100%', height: '100%' }}>
                    {/* FRONT */}
                    <Animated.View
                      style={[
                        styles.card,
                        getCardTransform(i),
                        { opacity: getOpacity(i, false) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.cardText,
                          { fontSize: Math.max(20, cardSize * 0.35) },
                        ]}
                      >
                        ❓
                      </Text>
                    </Animated.View>

                    {/* BACK */}
                    <Animated.View
                      style={[
                        styles.card,
                        styles.cardBack,
                        {
                          transform: [
                            {
                              rotateY: animsRef.current[i].interpolate({
                                inputRange: [0, 180],
                                outputRange: ['180deg', '360deg'],
                              }),
                            },
                          ],
                          opacity: getOpacity(i, true),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.cardText,
                          { fontSize: Math.max(20, cardSize * 0.35) },
                        ]}
                      >
                        {c.emoji}
                      </Text>
                    </Animated.View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.footer, isLandscape && styles.footerLandscape]}>
          <TouchableOpacity
            style={[styles.button, isLandscape && styles.buttonLandscape]}
            onPress={initGame}
          >
            <Text
              style={[
                styles.buttonText,
                isLandscape && styles.buttonTextLandscape,
              ]}
            >
              🔄 Restart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.revealBtn,
              isLandscape && styles.buttonLandscape,
            ]}
            onPress={() => {
              cards.forEach((_, idx) => animateTo(idx, 180).start());
              setMatched(cards.map((_, i) => i));
              clearInterval(timerRef.current);
              sounds.playWin();
              setGameCompleted(true);
            }}
          >
            <Text
              style={[
                styles.buttonText,
                isLandscape && styles.buttonTextLandscape,
              ]}
            >
              🎉 Reveal All
            </Text>
          </TouchableOpacity>
        </View>

        {gameCompleted && (
          <View style={[styles.winBox, isLandscape && styles.winBoxLandscape]}>
            <Text
              style={[styles.winText, isLandscape && styles.winTextLandscape]}
            >
              🎉 You Win!
            </Text>
            <Text
              style={[styles.winSub, isLandscape && styles.winSubLandscape]}
            >
              Score: {score}
            </Text>
            <Text
              style={[styles.winSub, isLandscape && styles.winSubLandscape]}
            >
              Time: {time}s
            </Text>
            <Text
              style={[styles.winSub, isLandscape && styles.winSubLandscape]}
            >
              Moves: {moves}
            </Text>
            <TouchableOpacity
              style={[
                styles.winButton,
                isLandscape && styles.winButtonLandscape,
              ]}
              onPress={initGame}
            >
              <Text
                style={[
                  styles.winButtonText,
                  isLandscape && styles.winButtonTextLandscape,
                ]}
              >
                Play Again
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f1724',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 12,
    minHeight: 700, // Minimum height to ensure content
  },
  containerLandscape: {
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 8,
    minHeight: 500,
  },

  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  titleLandscape: {
    fontSize: 22,
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  rowLandscape: {
    marginBottom: 12,
  },

  info: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  infoLandscape: {
    gap: 8,
  },

  infoText: {
    color: '#cfe8d1',
    fontWeight: '700',
    fontSize: 14,
  },
  infoTextLandscape: {
    fontSize: 13,
  },

  levels: {
    flexDirection: 'row',
  },
  levelsLandscape: {
    gap: 1,
  },

  levelBtn: {
    backgroundColor: '#1f2840',
    borderRadius: 8,
    marginLeft: 8,
    paddingHorizontal: 5,
    paddingVertical: 4,
    minWidth: 45,
  },
  levelBtnLandscape: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 60,
    marginLeft: 4,
  },

  levelBtnActive: {
    backgroundColor: '#5862e3',
  },

  levelTxt: {
    color: '#cfe8d1',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  levelTxtLandscape: {
    fontSize: 11,
  },

  levelTxtActive: {
    color: '#fff',
  },

  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 300,
  },
  gridContainerLandscape: {
    marginBottom: 12,
    minHeight: 250,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardWrapper: {
    margin: 4,
  },

  card: {
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    backgroundColor: '#1f2636',
    borderRadius: 10,
    elevation: 6,
    height: '100%',
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    width: '100%',
  },

  cardBack: {
    backgroundColor: '#2b7a78',
  },

  cardText: {
    color: '#fff',
    fontWeight: '800',
  },

  footer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  footerLandscape: {
    gap: 8,
    marginBottom: 15,
    paddingBottom: 10,
  },

  button: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonLandscape: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  buttonTextLandscape: {
    fontSize: 14,
  },

  revealBtn: {
    backgroundColor: '#2ecc71',
  },

  winBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  winBoxLandscape: {
    padding: 12,
    marginTop: 12,
    marginBottom: 15,
  },

  winText: {
    color: '#ffd166',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  winTextLandscape: {
    fontSize: 20,
    marginBottom: 6,
  },

  winSub: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  winSubLandscape: {
    fontSize: 13,
    marginBottom: 3,
  },

  winButton: {
    backgroundColor: '#5862e3',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 12,
  },
  winButtonLandscape: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
  },

  winButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  winButtonTextLandscape: {
    fontSize: 13,
  },
});
