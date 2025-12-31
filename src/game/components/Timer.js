// src/components/Timer.js
import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';

const Timer = ({ initialSeconds = 60, onTimeUp, isRunning = true }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Start timer
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount or when paused
    return () => clearInterval(intervalRef.current);
  }, [isRunning, onTimeUp]);

  return <Text style={styles.timer}>⏱ {seconds}s</Text>;
};

const styles = StyleSheet.create({
  timer: {
    color: '#ff4757',
    fontSize: 22,
    fontWeight: 'bold',
    margin: 10,
    textAlign: 'center',
  },
});

export default Timer;

// // src/components/Timer.js
// import React, { useEffect, useState, useRef } from 'react';
// import { Text, StyleSheet } from 'react-native';

// const Timer = ({ initialSeconds = 60, onTimeUp, isRunning = true }) => {
//   const [seconds, setSeconds] = useState(initialSeconds);
//   const intervalRef = useRef(null);

//   useEffect(() => {
//     if (!isRunning) return;

//     // Start timer
//     intervalRef.current = setInterval(() => {
//       setSeconds(prev => {
//         if (prev <= 1) {
//           clearInterval(intervalRef.current);
//           if (onTimeUp) onTimeUp();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(intervalRef.current);
//   }, [isRunning, onTimeUp]); // ✅ Correct deps, no warning

//   return <Text style={styles.timer}>⏱ {seconds}s</Text>;
// };

// const styles = StyleSheet.create({
//   timer: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#ff4757',
//     margin: 10,
//     textAlign: 'center',
//   },
// });

// export default Timer;
