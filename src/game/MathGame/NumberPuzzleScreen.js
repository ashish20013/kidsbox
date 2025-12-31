import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import Sound from 'react-native-sound';
// import Sound from 'react-native-sound-media';

const { width, height } = Dimensions.get('window');
Sound.setCategory('Playback');

export default function NumberPuzzleScreen() {
  const gridSize = 3;
  const totalTiles = gridSize * gridSize;

  const [tiles, setTiles] = useState([]);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(1)).current;
  const shine = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef([]).current;

  const coinSound = useRef(null);
  const correctSound = useRef(null);
  const gameoverSound = useRef(null);
  const wrongSound = useRef(null);

  /* ---------- Utility Callbacks ---------- */
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  }, [stopTimer]);

  const shuffleArray = useCallback(arr => {
    let shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const generatePuzzle = useCallback(() => {
    let arr = Array.from({ length: totalTiles }, (_, i) =>
      i === totalTiles - 1 ? null : i + 1,
    );
    arr = shuffleArray(arr);
    setTiles(arr);
    setScore(0);
    setSeconds(0);
    startTimer();

    for (let i = 0; i < arr.length; i++) {
      flipAnim[i] = new Animated.Value(0);
    }
  }, [shuffleArray, startTimer, flipAnim, totalTiles]);

  /* ---------- Sound Player ---------- */
  const playSound = useCallback(soundRef => {
    soundRef.current?.stop(() => {
      soundRef.current?.play();
    });
  }, []);

  /* ---------- Initial Effect ---------- */
  useEffect(() => {
    coinSound.current = new Sound('coin.mp3', Sound.MAIN_BUNDLE);
    correctSound.current = new Sound('correct.mp3', Sound.MAIN_BUNDLE);
    gameoverSound.current = new Sound('gameover.mp3', Sound.MAIN_BUNDLE);
    wrongSound.current = new Sound('wrong.mp3', Sound.MAIN_BUNDLE);

    generatePuzzle();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.02,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(shine, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ).start();

    return () => {
      stopTimer();
      coinSound.current?.release();
      correctSound.current?.release();
      gameoverSound.current?.release();
      wrongSound.current?.release();
    };
  }, [generatePuzzle, breathe, shine, stopTimer]);

  /* ---------- Core Logic ---------- */
  const getValidMoves = useCallback(
    emptyIndex => {
      const moves = [];
      const row = Math.floor(emptyIndex / gridSize);
      const col = emptyIndex % gridSize;
      if (row > 0) {
        moves.push(emptyIndex - gridSize);
      }
      if (row < gridSize - 1) {
        moves.push(emptyIndex + gridSize);
      }
      if (col > 0) {
        moves.push(emptyIndex - 1);
      }
      if (col < gridSize - 1) {
        moves.push(emptyIndex + 1);
      }
      return moves;
    },
    [gridSize],
  );

  const checkWin = useCallback(
    arr => {
      for (let i = 0; i < totalTiles - 1; i++) {
        if (arr[i] !== i + 1) {
          return false;
        }
      }
      return true;
    },
    [totalTiles],
  );

  const moveTile = useCallback(
    index => {
      const emptyIndex = tiles.indexOf(null);
      const validMoves = getValidMoves(emptyIndex);
      if (validMoves.includes(index)) {
        const newTiles = [...tiles];
        [newTiles[index], newTiles[emptyIndex]] = [
          newTiles[emptyIndex],
          newTiles[index],
        ];
        setTiles(newTiles);
        playSound(coinSound);

        Animated.sequence([
          Animated.timing(flipAnim[index], {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(flipAnim[index], {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();

        setScore(s => s + 10);

        if (checkWin(newTiles)) {
          showMessage('🎉 Puzzle Solved! ⭐');
          stopTimer();
          setScore(s => s + 100);
          winPulse();
          playSound(correctSound);
        }
      } else {
        playSound(wrongSound);
      }
    },
    [tiles, getValidMoves, flipAnim, checkWin, stopTimer, playSound],
  );

  const showMessage = useCallback(
    msg => {
      setMessage(msg);
      fadeAnim.setValue(1);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1600,
        useNativeDriver: true,
      }).start();
    },
    [fadeAnim],
  );

  const winPulse = useCallback(() => {
    Animated.sequence([
      Animated.spring(breathe, { toValue: 1.06, useNativeDriver: true }),
      Animated.spring(breathe, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [breathe]);

  /* ---------- PanResponder ---------- */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const nx = (g.moveY - height / 2) / (height / 2);
        const ny = (g.moveX - width / 2) / (width / 2);
        Animated.spring(tiltX, {
          toValue: nx * 8,
          useNativeDriver: true,
        }).start();
        Animated.spring(tiltY, {
          toValue: -ny * 8,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderRelease: () => {
        Animated.spring(tiltX, { toValue: 0, useNativeDriver: true }).start();
        Animated.spring(tiltY, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  /* ---------- Render ---------- */
  const renderTile = ({ item, index }) => {
    if (!flipAnim[index]) {
      flipAnim[index] = new Animated.Value(0);
    }
    const rotateY = flipAnim[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
    return (
      <TouchableOpacity
        style={[styles.tileWrapper, item === null && styles.emptyTile]}
        onPress={() => moveTile(index)}
        disabled={item === null}
      >
        {item && (
          <Animated.View style={{ transform: [{ rotateY }] }}>
            <Text style={styles.tileText}>{item}</Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  const sweepTranslate = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const formatTime = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Text style={styles.topText}>⏱ {formatTime(seconds)}</Text>
        <Text style={styles.topText}>⭐ {score}</Text>
      </View>

      <Text style={styles.title}>🔢 Number Puzzle</Text>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { perspective: 900 },
              {
                rotateX: tiltX.interpolate({
                  inputRange: [-20, 20],
                  outputRange: ['-16deg', '16deg'],
                }),
              },
              {
                rotateY: tiltY.interpolate({
                  inputRange: [-20, 20],
                  outputRange: ['-16deg', '16deg'],
                }),
              },
              { scale: breathe },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.sweep,
            {
              transform: [{ translateX: sweepTranslate }, { rotate: '12deg' }],
            },
          ]}
        />
        <FlatList
          data={tiles}
          renderItem={renderTile}
          keyExtractor={(item, index) => index.toString()}
          numColumns={gridSize}
          scrollEnabled={false}
          contentContainerStyle={styles.grid}
        />
        <TouchableOpacity style={styles.shuffleBtn} onPress={generatePuzzle}>
          <Text style={styles.shuffleText}>🔄 Shuffle</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
        {message}
      </Animated.Text>
      <Text style={styles.guide}>
        📘 How to Play: Tap on the tile near empty space → Arrange in order 1 →
        8 → Puzzle solved = Victory 🎉
      </Text>
    </View>
  );
}

/* ---------- STYLES ---------- */
const CARD_W = width * 0.9;
const TILE = width * 0.22;

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#0f1428',
    borderRadius: 18,
    justifyContent: 'center',
    marginVertical: 20,
    padding: 20,
    width: CARD_W,
  },
  emptyTile: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(100,120,170,0.35)',
  },
  grid: { alignItems: 'center', justifyContent: 'center' },
  guide: {
    color: '#7b93d2',
    fontSize: 11,
    marginTop: 6,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  message: { color: '#9be7ff', fontSize: 18, fontWeight: '800', marginTop: 8 },
  root: {
    alignItems: 'center',
    backgroundColor: '#0a0f1b',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  shuffleBtn: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  shuffleText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sweep: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    height: 90,
    position: 'absolute',
    top: -40,
    width: CARD_W * 0.8,
  },
  tileText: { color: '#0b0f1a', fontSize: 26, fontWeight: '900' },
  tileWrapper: {
    alignItems: 'center',
    backgroundColor: '#69e0a8',
    borderRadius: 16,
    height: TILE,
    justifyContent: 'center',
    margin: 6,
    width: TILE,
  },
  title: { color: '#cfe3ff', fontSize: 22, fontWeight: '800', marginTop: 80 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    position: 'absolute',
    top: 40,
    width: '100%',
  },
  topText: {
    color: '#9be7ff',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(80,200,255,0.5)',
    textShadowRadius: 6,
  },
});
