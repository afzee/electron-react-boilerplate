import { words1k } from './data/english1k';
import { words5k } from './data/english5k';
import { spaces } from './data/spaces';
import React, { Children, useEffect, useRef } from 'react';
import { useState } from 'react';
import { Letter } from './components/letter';
import cursorStyles from './animation/cursor.module.css';
import timerStyles from './animation/timer.module.css';
import keymapColor from './images/km-color.png';
import keymapDefault from './images/km-default.png';
import tachi from './images/tachi.png';

export namespace TrainerScreen {
  export type Props = {};
}

export const TrainerScreen: React.FC<TrainerScreen.Props> = (props) => {
  const {} = props;
  const numOfWords = 15;
  const [maxTime, setMaxTime] = useState(30);
  const [timerBtnClicked, setTimerBtnClicked] = useState(false);
  const [bankBtnClicked, setBankBtnClicked] = useState(false);
  const [currentWordBank, setCurrentWordBank] = useState('english1k');
  const initialPrompt = generatePrompts(bankBtnClicked);
  const [currentPrompt, setCurrentPrompt] = useState(initialPrompt);
  const [displayMetrics, setDisplayMetrics] = useState(false);

  // Timer states
  const [timer, setTimer] = useState(maxTime);
  const [activeTimer, setActiveTimer] = useState(false);
  const [endTest, setEndTest] = useState(false);
  const [timerPercent, setTimerPercent] = useState(100);

  // Input states
  const [userInput, setUserInput] = useState('');
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [totalInput, setTotalInput] = useState(''); // userInputs from all sentences during a test joined into one string

  const [firstFocusChar, setFirstFocusChar] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  const metricsResult = calculateMetrics(totalInput);

  // Keymap states
  const [kmColorMode, setkmColorMode] = useState(true);
  const [kmEnabled, setKmEnabled] = useState(true);

  // Error boolean
  const [errorStatus, setErrorStatus] = useState(false);

  // Add input character to userInput & totalInput
  function addInputChar(input: string) {
    setUserInput(userInput + input);
    setTotalInput(totalInput + input);
  }
  console.log({ initialPrompt });

  function generatePrompts(is5k: boolean) {
    const renderWords = is5k
      ? words5k.sort(() => Math.random() - 0.5).slice(0, numOfWords - 1)
      : words1k // DEBUGGING! CHANGE BACK TO words1k WHEN FINITO
          .sort(() => Math.random() - 0.5)
          .slice(0, numOfWords);

    return renderWords;
  }

  function wbDisplay(is5k: boolean) {
    setCurrentWordBank(!is5k ? 'english1k' : 'english5k');
  }

  // Updates renderer with new prompts
  function updatePrompts(wbBtnClicked: boolean) {
    const newPrompts = generatePrompts(wbBtnClicked);
    setCurrentPrompt(newPrompts);
    setUserInput('');
    setCurrentLetterIndex(0);
    setErrorStatus(false);
  }

  // Starts interval
  function startTimer() {
    setActiveTimer(true);
    let interval = setInterval(() => {
      setTimer((previousTime) => {
        if (previousTime === 0) {
          clearInterval(interval);
          setEndTest(true);
          setTimerPercent(0);
          return 0;
        } else {
          const newTimerPercent = ((previousTime - 1) / maxTime) * 100;
          setTimerPercent(newTimerPercent);
          return previousTime - 1;
        }
      });
    }, 1000);
  }

  // Calculate WPM and Accuracy
  function calculateMetrics(input: string) {
    const charArr = input.split('');
    const accuracy = Math.floor(
      (charArr.filter((char) => char === char.toLowerCase()).length /
        charArr.length) *
        100,
    );
    const wordsPM =
      charArr.filter((char) => char === ' ').length / (maxTime / 60);
    return 'WPM: ' + wordsPM + ' | Accuracy: ' + accuracy + '%';
  }

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const sessionDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = () => {
      console.log('key down');
      isFocused ? null : setFirstFocusChar(true),
        textAreaRef.current?.focus(),
        setIsFocused(true);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  function changeMaxTime(timerClicked: Boolean) {
    timerClicked
      ? (setMaxTime(60), setTimer(60))
      : (setMaxTime(30), setTimer(30));
  }

  // ${} to pass js

  return (
    <>
      <div className="container mr-[5rem] mt-[3rem]">
        <div className="ml-[3rem] container justify-center items-center h-1/3 flex flex-row relative">
          <div className="items-center flex flex-col">
            <div
              className={`container relative flex flex-row w-2/3 items-center `}
            >
              <div // Metrics object
                className={`absolute object-center flex-auto text-white mb-[1rem] ${endTest ? 'visible' : 'invisible'}`}
              >
                {' '}
                {metricsResult}
              </div>
              <div // Prompt object
                className={`relative flex justify-center items-center align-middle ${
                  endTest ? 'invisible' : 'visible'
                }`}
              >
                <div // prompt
                  className={`flex flex-wrap w-full p-5 text-white ${!isFocused ? 'blur-sm' : ''}  gap-[0.5rem]`}
                  onClick={() => {
                    textAreaRef.current?.focus(), setIsFocused(true);
                  }}
                >
                  {currentPrompt.map((word, wordIndex) => (
                    <div className="flex">
                      {word.split('').map((letter, charIndex) => {
                        const prevWords = currentPrompt.slice(0, wordIndex);
                        const prevWordCount =
                          wordIndex === 0
                            ? 0
                            : prevWords.reduce(
                                (totalCount, word) =>
                                  totalCount + word.length + 1,
                                0,
                              );
                        const ctxIx = charIndex + prevWordCount;

                        const showCursor = currentLetterIndex === ctxIx;
                        const showSpaceCursor =
                          word.length + prevWordCount === currentLetterIndex &&
                          ctxIx + 1 == currentLetterIndex;
                        return (
                          <div className="flex text-center text-3xl font-light relative">
                            <Letter
                              key={ctxIx}
                              isTyped={
                                ctxIx in userInput.split('') &&
                                userInput.split('')[ctxIx] !== ''
                              }
                              isCorrect={
                                currentPrompt.join(' ').split('')[ctxIx] ==
                                userInput.split('')[ctxIx]
                              }
                              typedColor="#FFF"
                              untypedColor="#828282"
                              incorrectColor="#f05454"
                            >
                              {letter}
                            </Letter>

                            <div className={cursorStyles.cursor}>
                              {showCursor ? (
                                <div className="absolute left-[-2px]">|</div>
                              ) : null}
                              {showSpaceCursor ? (
                                <div className="absolute right-[-2px]">|</div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div // focus banner
                  className={`justify-center flex flex-col absolute object-center w-1/2 h-1/2 ${
                    isFocused || endTest ? 'invisible' : 'visible'
                  } bg-slate-200 rounded-sm opacity-80`}
                  onClick={() => {
                    textAreaRef.current?.focus(), setIsFocused(true);
                  }}
                >
                  <div className="pl-[2rem] pr-[2rem] object-center text-black  text-center">
                    Click here or press any key to focus on the prompt
                  </div>
                </div>
              </div>
              <div // Timer
                className={`m-[1rem] flex-none ${timerStyles.timer} p-[0.5rem] size-[5rem]`}
                style={{ '--timer-percent': `${timerPercent}%` }}
              >
                <div className="flex size-full justify-center items-center">
                  <span className="content-center font-medium text-wrap text-center text-white">
                    {timer}s
                  </span>
                </div>
              </div>
            </div>
            <textarea
              ref={textAreaRef}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => {
                const input = e.target.value;
                const inputArr = input.split('');
                const lastLetter = inputArr[inputArr.length - 1];
                const errorLetter = lastLetter.toUpperCase();
                const isCorrectInput =
                  lastLetter ===
                  currentPrompt.join(' ').split('')[currentLetterIndex];

                if (!endTest) {
                  input !== '' && !activeTimer ? startTimer() : null;
                  firstFocusChar
                    ? setFirstFocusChar(false)
                    : isCorrectInput
                      ? errorStatus
                        ? (addInputChar(errorLetter),
                          setCurrentLetterIndex(currentLetterIndex + 1),
                          setErrorStatus(false))
                        : (addInputChar(lastLetter),
                          setCurrentLetterIndex(currentLetterIndex + 1))
                      : setErrorStatus(true);

                  inputArr.length > currentPrompt.join(' ').split('').length &&
                  lastLetter === ' '
                    ? updatePrompts(bankBtnClicked)
                    : null;
                }
              }}
              value={userInput}
              className="w-1 h-1 resize-none absolute top-0 left-0 opacity-0"
              id="promptInput"
            ></textarea>
            <div // Restart button
              className="mt-[1rem] container h-1/6 flex flex-row justify-center items-center"
            >
              <button
                className="bg-slate-700 p-[.5rem] size-[4rem] rounded-full mb-[0.5rem] text-white text-xs"
                onClick={() => {
                  setEndTest(false);
                  setActiveTimer(false);
                  window.location.reload();
                  console.log('restart pressed');
                }}
              >
                Restart
              </button>
            </div>
          </div>
        </div>
        <div // Keymap
          className={`relative container m-[3rem] justify-center flex w-full`}
        >
          <img
            src={tachi}
            className={`absolute ${kmEnabled ? 'visible' : 'invisible'} hover:top-[-5rem] top-[-4rem] right-[6rem] cursor-pointer`}
            onClick={() => {
              setkmColorMode(!kmColorMode);
            }}
          />
          <img
            src={kmColorMode ? keymapColor : keymapDefault}
            className={`${kmEnabled ? 'visible' : 'invisible'}`}
          />
        </div>
      </div>
      <div // Navbar
        className="bg-slate-700 flex flex-wrap flex-col absolute m-[0.5rem] right-0 top-1/4 p-[0.5rem] rounded-lg object-center"
      >
        <button // Wordbank button
          className="bg-slate-800 p-[.5rem] size-[5rem] rounded-md mb-[0.5rem] text-white text-sm"
          onClick={() => {
            !endTest
              ? (wbDisplay(!bankBtnClicked),
                updatePrompts(!bankBtnClicked),
                setBankBtnClicked(!bankBtnClicked),
                console.log('english5k? ' + bankBtnClicked))
              : null;
          }}
        >
          Current: {currentWordBank}
        </button>
        <button // Timer button
          className="bg-slate-800 p-[.5rem] size-[5rem] rounded-md mb-[0.5rem] text-white text-sm"
          onClick={() => {
            !endTest
              ? (changeMaxTime(!timerBtnClicked),
                setTimerBtnClicked(!timerBtnClicked),
                console.log('max time? ' + maxTime))
              : console.log('Timer is active, cannot change time');
          }}
        >
          Timer: {maxTime}s
        </button>
        <button // Keymap button
          className="bg-slate-800 p-[.5rem] size-[5rem] rounded-md mb-[0.5rem] text-white text-sm"
          onClick={() => {
            setKmEnabled(!kmEnabled);
            console.log('Keymap enabled? ' + kmEnabled);
            console.log('Color mode? ' + kmColorMode);
          }}
        >
          Keymap {kmEnabled ? 'off' : 'on'}
        </button>
      </div>
    </>
  );
};
