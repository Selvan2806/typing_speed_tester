import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Timer, Target, Zap } from 'lucide-react';

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once.",
  "Programming is the art of telling a computer what to do. It requires logic, creativity, and patience to master.",
  "In the realm of software development, clean code is not just about functionality but also readability and maintainability.",
  "Technology advances at an exponential rate, transforming how we live, work, and communicate with each other daily.",
  "The best way to predict the future is to create it. Innovation stems from curiosity and the courage to experiment.",
];

type CharState = 'pending' | 'correct' | 'incorrect' | 'current';

const TypingTest = () => {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);

  const initializeTest = useCallback(() => {
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setText(randomText);
    setUserInput('');
    setIsStarted(false);
    setIsFinished(false);
    setStartTime(null);
    setElapsedTime(0);
    setWpm(0);
    setAccuracy(100);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    initializeTest();
  }, [initializeTest]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isFinished && startTime) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setElapsedTime(elapsed);
        
        // Calculate WPM
        const words = userInput.trim().split(/\s+/).filter(w => w.length > 0).length;
        const minutes = elapsed / 60;
        if (minutes > 0) {
          setWpm(Math.round(words / minutes));
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isStarted, isFinished, startTime, userInput]);

  const calculateAccuracy = useCallback((input: string) => {
    if (input.length === 0) return 100;
    let correct = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === text[i]) correct++;
    }
    return Math.round((correct / input.length) * 100);
  }, [text]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!isStarted && value.length > 0) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    if (value.length <= text.length) {
      setUserInput(value);
      setAccuracy(calculateAccuracy(value));
      
      if (value.length === text.length) {
        setIsFinished(true);
      }
    }
  };

  const getCharState = (index: number): CharState => {
    if (index === userInput.length) return 'current';
    if (index >= userInput.length) return 'pending';
    if (userInput[index] === text[index]) return 'correct';
    return 'incorrect';
  };

  const getCharClassName = (state: CharState): string => {
    switch (state) {
      case 'correct':
        return 'text-typed';
      case 'incorrect':
        return 'text-error bg-error/20 rounded';
      case 'current':
        return 'text-current text-glow';
      case 'pending':
      default:
        return 'text-pending';
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-foreground mb-2">
            type<span className="text-primary">speed</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Test your typing speed and accuracy
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center gap-6 md:gap-12 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 text-secondary-foreground">
            <Timer className="w-5 h-5 text-primary" />
            <span className="font-mono text-xl md:text-2xl font-semibold">
              {formatTime(elapsedTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-secondary-foreground">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-mono text-xl md:text-2xl font-semibold">
              {wpm} <span className="text-sm text-muted-foreground">wpm</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-secondary-foreground">
            <Target className="w-5 h-5 text-primary" />
            <span className="font-mono text-xl md:text-2xl font-semibold">
              {accuracy}%
            </span>
          </div>
        </div>

        {/* Typing Area */}
        <div 
          className="bg-card rounded-xl p-6 md:p-8 mb-6 cursor-text scale-in"
          style={{ animationDelay: '0.2s' }}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="font-mono text-lg md:text-xl leading-relaxed tracking-wide select-none">
            {text.split('').map((char, index) => {
              const state = getCharState(index);
              return (
                <span
                  key={index}
                  className={`${getCharClassName(state)} transition-colors duration-100 ${
                    state === 'current' ? 'relative' : ''
                  }`}
                >
                  {state === 'current' && (
                    <span className="absolute -left-[1px] top-0 w-[2px] h-full bg-primary cursor-blink" />
                  )}
                  {char}
                </span>
              );
            })}
          </div>
          
          {/* Hidden Input */}
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="opacity-0 absolute -z-10"
            autoFocus
            disabled={isFinished}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>

        {/* Click hint */}
        {!isStarted && (
          <p className="text-center text-muted-foreground text-sm mb-6 fade-in">
            Click the text area and start typing
          </p>
        )}

        {/* Results */}
        {isFinished && (
          <div className="bg-card rounded-xl p-6 md:p-8 mb-6 text-center scale-in">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Test Complete!</h2>
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary font-mono">{wpm}</p>
                <p className="text-muted-foreground text-sm">Words/min</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-success font-mono">{accuracy}%</p>
                <p className="text-muted-foreground text-sm">Accuracy</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-foreground font-mono">{formatTime(elapsedTime)}</p>
                <p className="text-muted-foreground text-sm">Time</p>
              </div>
            </div>
          </div>
        )}

        {/* Restart Button */}
        <div className="flex justify-center fade-in" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={initializeTest}
            className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Test
          </button>
        </div>

        {/* Footer hint */}
        <p className="text-center text-muted-foreground/50 text-xs mt-12">
          Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">Tab</kbd> + <kbd className="px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">Enter</kbd> to restart
        </p>
      </div>
    </div>
  );
};

export default TypingTest;
