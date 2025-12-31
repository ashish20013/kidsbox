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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
// import Sound from 'react-native-sound-media';

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

/* ------------------------------- MAIN SCREEN ------------------------------- */
export default function TapTheColorScreen() {
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

  const colors = useMemo(
    () => ({
      easy: ['#ff5252', '#448aff', '#4caf50', '#ffd740'],
      medium: [
        '#ff5252',
        '#448aff',
        '#4caf50',
        '#ffd740',
        '#ab47bc',
        '#ff9800',
      ],
      hard: [
        '#ff5252',
        '#448aff',
        '#4caf50',
        '#ffd740',
        '#ab47bc',
        '#ff9800',
        '#ec407a',
        '#6d4c41',
      ],
    }),
    [],
  );

  const pickRandomColor = useCallback(() => {
    const set = colors[difficulty];
    setTargetColor(set[Math.floor(Math.random() * set.length)]);
  }, [colors, difficulty]);

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

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>🎯 Tap The Color</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>⭐ {score}</Text>
          </View>
        </View>

        <View style={styles.progressWrap}>
          <Animated.View style={[styles.progressFill, { width: barWidth }]} />
        </View>
        <Animated.Text
          style={[
            styles.timerText,
            timeLeft <= 8 && {
              color: '#ff3b30',
              transform: [{ scale: pulseScale }],
            },
          ]}
        >
          ⏳ {timeLeft}s
        </Animated.Text>

        <View style={styles.targetPill}>
          <Text style={styles.targetLabel}>Tap</Text>
          <View
            style={[styles.targetSwatch, { backgroundColor: targetColor }]}
          />
          <Text style={styles.targetValue}>{targetColor.toUpperCase()}</Text>
        </View>

        <View style={styles.grid}>
          {colors[difficulty].map(c => (
            <ScaleTile key={c} color={c} onPress={() => handleTap(c)} />
          ))}
        </View>

        <View style={styles.diffRow}>
          {['easy', 'medium', 'hard'].map(lvl => (
            <TouchableOpacity
              key={lvl}
              onPress={() => changeDifficulty(lvl)}
              style={[
                styles.diffChip,
                difficulty === lvl && styles.diffChipActive,
              ]}
            >
              <Text
                style={[
                  styles.diffText,
                  difficulty === lvl && styles.diffTextActive,
                ]}
              >
                {lvl.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={restart}>
            <Text style={styles.secondaryTxt}>Restart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={finishGame}>
            <Text style={styles.primaryTxt}>End Game</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.lbCard}>
        <Text style={styles.lbTitle}>🏆 ScoreBoard</Text>
        {leaderboard.length === 0 ? (
          <Text style={styles.lbEmpty}>Play to set your first high score!</Text>
        ) : (
          leaderboard.map((e, i) => (
            <View key={`${e.date}-${i}`} style={styles.lbRow}>
              <Text style={styles.lbRank}>{i + 1}.</Text>
              <Text style={styles.lbScore}>{e.score} pts</Text>
              <Text style={styles.lbDiff}>{e.difficulty}</Text>
              <Text style={styles.lbDate}>{e.date}</Text>
            </View>
          ))
        )}
        <View style={{ height: 8 }} />
        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={async () => {
            await AsyncStorage.removeItem('@ttc_leaderboard');
            setLeaderboard([]);
          }}
        >
          <Text style={styles.ghostTxt}>Clear Leaderboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------------------- Animated Tile Btn ---------------------------- */
const ScaleTile = ({ color, onPress }) => {
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
        style={[styles.tile, { backgroundColor: color }]}
      />
    </Animated.View>
  );
};

/* --------------------------------- STYLES --------------------------------- */
const styles = StyleSheet.create({
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 14,
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
  diffChip: {
    backgroundColor: '#222742',
    borderColor: '#2f3560',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  diffChipActive: {
    backgroundColor: '#3b4180',
    borderColor: '#5862e3',
  },
  diffRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
  },
  diffText: { color: '#b8c0ff', fontSize: 12, fontWeight: '700' },

  diffTextActive: { color: '#ffffff' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 14,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

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
  lbDate: { color: '#aeb6da', flex: 1, fontSize: 12, textAlign: 'right' },
  lbDiff: {
    color: '#ffd666',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    width: 70,
  },
  lbEmpty: { color: '#9aa3c7' },

  lbRank: { color: '#cbd4ff', fontWeight: '700', width: 22 },
  lbRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  lbScore: { color: '#ffffff', fontWeight: '800', width: 70 },

  lbTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  primaryBtn: {
    alignItems: 'center',
    backgroundColor: '#5862e3',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  primaryTxt: { color: '#fff', fontWeight: '800' },
  progressFill: {
    backgroundColor: '#21d07a',
    borderRadius: 8,
    height: '100%',
  },
  progressWrap: {
    backgroundColor: '#2a2f55',
    borderRadius: 8,
    height: 8,
    marginTop: 14,
    overflow: 'hidden',
  },

  scoreBadge: {
    backgroundColor: '#232848',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scoreText: { color: '#fff', fontWeight: '700' },
  screen: {
    backgroundColor: '#0f1220',
    flex: 1,
    padding: 16,
  },
  secondaryBtn: {
    alignItems: 'center',
    borderColor: '#3c436e',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  secondaryTxt: { color: '#d4dcff', fontWeight: '700' },

  targetLabel: { color: '#b8c0ff', fontWeight: '600' },
  targetPill: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#232848',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  targetSwatch: { borderRadius: 4, height: 16, width: 16 },
  targetValue: { color: '#fff', fontWeight: '800', letterSpacing: 1 },
  tile: {
    borderRadius: 16,
    height: 88,
    width: 88,
    ...Platform.select({
      android: { elevation: 4 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  tileWrap: { margin: 10 },
  timerText: {
    alignSelf: 'center',
    color: '#c8ffdf',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  title: { color: '#ffffff', fontSize: 22, fontWeight: '700' },
});
