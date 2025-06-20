import React, { useEffect } from 'react';
import useQuizStore from '../stores/quizStore';
import useLessonStore from '../stores/lessonStore';
import { getGitHubQuestionEditUrl } from '../utils/githubLinks';

/**
 * @typedef {Object} Answer
 * @property {string} text - The text of the answer
 * @property {boolean} correct - Whether the answer is correct
 * @property {string} [explanation] - Optional explanation for the answer
 */

/**
 * A client-side component for displaying a quiz question
 * @param {Object} props - Component props
 * @param {string} props.id - The question ID
 * @param {string} props.question - The question text
 * @param {Answer[]} props.answers - Array of possible answers
 * @param {Function} [props.onShowLesson] - Optional callback when showing lesson
 * @returns {React.ReactElement} The rendered component
 */
export default function QuizCard({ id, question, answers, onShowLesson }) {
  // Get state and actions from quiz store
  const { 
    hasAnswered, 
    selectedAnswerIndex, 
    randomizedAnswers,
    isCurrentQuestionAttempted: isAttempted,
    isCurrentQuestionCorrect: isCorrect,
    setCurrentQuestion,
    selectAnswer,
    resetQuestion
  } = useQuizStore();

  // Get state and actions from lesson store
  const { isVisible: isLessonVisible, hideLesson } = useLessonStore();

  const letters = ['A', 'B', 'C', 'D'];

  // Set current question when component mounts or when question/answers change
  useEffect(() => {
    if (id && answers) {
      setCurrentQuestion(id, answers);
    }
  }, [id, answers, setCurrentQuestion]);

  // Listen for the lesson-content-closed event
  useEffect(() => {
    const handleLessonClosed = () => {
      hideLesson();
    };

    document.addEventListener('lesson-content-closed', handleLessonClosed);

    return () => {
      document.removeEventListener('lesson-content-closed', handleLessonClosed);
    };
  }, [hideLesson]);

  // Store a reference to getState to use in event handlers
  const getQuizState = useQuizStore.getState;

  /**
   * Handle answer selection
   * @param {number} index - The index of the selected answer
   */
  const handleAnswerClick = (index) => {
    // Use the selectAnswer action from the quiz store
    selectAnswer(index);

    // For backward compatibility with the DOM-based progress display
    // This can be removed once TopNav is refactored to use Zustand
    const { attemptedQuestions, correctlyAnsweredQuestions } = getQuizState();

    // Update the display in the TopNav
    const questionsAttemptedEl = document.getElementById('questionsAttempted');
    const questionsCorrectEl = document.getElementById('questionsCorrect');

    if (questionsAttemptedEl) {
      questionsAttemptedEl.textContent = attemptedQuestions.length.toString();
    }

    if (questionsCorrectEl) {
      questionsCorrectEl.textContent = correctlyAnsweredQuestions.length.toString();
    }
  };

  /**
   * Get question IDs from cache or fetch them from the server
   * @returns {Promise<string[]>} Array of question IDs
   */
  const getQuestionIds = async () => {
    // Try to get question IDs from localStorage first (if available and not expired)
    const cachedData = localStorage.getItem('questionIds');
    const cacheTimestamp = localStorage.getItem('questionIdsTimestamp');
    const cacheExpiration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Check if we have valid cached data
    if (cachedData && cacheTimestamp && 
        (Date.now() - parseInt(cacheTimestamp)) < cacheExpiration) {
      console.log('Using cached question IDs');
      return JSON.parse(cachedData);
    }

    // Fetch the question IDs from the generated JSON file
    try {
      const response = await fetch('/data/question-ids.json');

      if (!response.ok) {
        console.error(`Failed to fetch question IDs: ${response.status}`);
        return [];
      }

      const questionIds = await response.json();

      // Cache the question IDs in localStorage
      localStorage.setItem('questionIds', JSON.stringify(questionIds));
      localStorage.setItem('questionIdsTimestamp', Date.now().toString());
      console.log('Fetched and cached question IDs');

      return questionIds;
    } catch (error) {
      console.error('Error fetching question IDs:', error);
      return [];
    }
  };

  // Handle next question button click
  const handleNextQuestion = async () => {
    try {
      const questionIds = await getQuestionIds();

      if (questionIds.length === 0) {
        console.error('No question IDs found');
        // Skip to the catch block
        return;
      }

      // Select a random question ID
      const randomIndex = Math.floor(Math.random() * questionIds.length);
      const selectedQuestionId = questionIds[randomIndex];

      // Navigate to the selected question
      window.location.href = `/quiz/${selectedQuestionId}`;
    } catch (error) {
      console.error('Error navigating to random question:', error);

      // Fallback: If we can't get the question IDs, use the old method
      window.location.href = '/quiz';

      // Show an error message
      alert('Sorry, we encountered an error loading the next question. Trying alternative method.');
    }
  };

  // Handle show lesson button click
  const handleShowLesson = () => {
    if (isLessonVisible) {
      // If lesson is already visible, hide it
      handleHideLesson();
      return;
    }

    // For backward compatibility, dispatch the custom event
    // This can be removed once [id].astro is refactored to use Zustand
    document.dispatchEvent(new CustomEvent('showLesson', {
      detail: { questionId: id }
    }));

    // Also call the onShowLesson prop if provided
    if (onShowLesson) {
      onShowLesson(id);
    }

    // Note: We don't call showLesson here because it's handled by the event listener in [id].astro
    // which will set the content properly

    // Add a small delay to ensure the LessonContent component is rendered
    setTimeout(() => {
      // Find the lesson-content element and scroll to it smoothly
      const lessonContent = /** @type {HTMLElement} */ (document.querySelector('.lesson-content'));
      if (lessonContent) {
        /**
         * Custom smooth scroll function with slower animation
         * @param {HTMLElement} element - The element to scroll to
         */
        const scrollToElement = (element) => {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const startPosition = window.pageYOffset;
          const distance = elementPosition - startPosition;
          const duration = 1000; // Longer duration for slower animation (in ms)
          /** @type {number|null} */
          let startTime = null;

          /**
           * Animation frame callback
           * @param {number} currentTime - Current timestamp
           */
          const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const scrollY = easeInOutCubic(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, scrollY);

            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          };

          /**
           * Easing function for smoother animation
           * @param {number} t - Current time
           * @param {number} b - Start value
           * @param {number} c - Change in value
           * @param {number} d - Duration
           * @returns {number} The calculated value
           */
          const easeInOutCubic = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
          };

          requestAnimationFrame(animation);
        };

        scrollToElement(lessonContent);
      }
    }, 100);
  };

  // Handle hide lesson button click
  const handleHideLesson = () => {
    // For backward compatibility, dispatch the custom event
    // This can be removed once LessonContent.jsx is refactored to use Zustand
    document.dispatchEvent(new CustomEvent('react-close-lesson-content'));

    // Use the hideLesson action from the lesson store
    hideLesson();
  };

  // Handle retry button click
  const handleRetry = () => {
    // Use the resetQuestion action from the quiz store
    resetQuestion();
  };

  return (
    <div className="quiz-card bg-white rounded-lg shadow-md p-6 mb-6 relative" data-lesson={id}>
      <div className="mb-2 text-sm text-gray-500 flex items-center justify-between">
        <span>Question ID: {id}</span>
        <div className="flex items-center">
          {id && (
            <a 
              href={getGitHubQuestionEditUrl(id) ?? undefined} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors flex items-center group mr-2"
              title="Contribute to this question"
            >
              <span className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs">Edit question or lesson</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="inline-block"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          )}
          {isCorrect && (
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {isAttempted && !isCorrect && (
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-6">{question}</h2>

      <div className="answers-container">
        {randomizedAnswers.length > 0 && randomizedAnswers.map(/**
         * Render an answer option
         * @param {Answer} answer - The answer object
         * @param {number} index - The index of the answer in the array
         * @returns {React.ReactElement} The rendered answer component
         */
        (answer, index) => (
          <div key={index} className="answer-container mb-3">
            <button 
              className={`answer-button w-full text-left p-4 border rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                hasAnswered && index === selectedAnswerIndex && answer.correct ? 'bg-green-100 border-green-500' : ''
              } ${
                hasAnswered && index === selectedAnswerIndex && !answer.correct ? 'bg-red-100 border-red-500' : ''
              } ${
                hasAnswered && answer.correct && index !== selectedAnswerIndex ? 'bg-green-50 border-green-300' : ''
              }`}
              onClick={() => handleAnswerClick(index)}
              disabled={hasAnswered}
            >
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-gray-700 mr-3 flex-shrink-0">
                  {letters[index]}
                </span>
                <span>{answer.text}</span>
              </div>
            </button>

            {hasAnswered && (answer.correct || index === selectedAnswerIndex) && (
              <div className="explanation mt-2 ml-9 text-sm text-gray-600">
                {answer.explanation || (answer.correct ? "This is the correct answer." : "This is not the correct answer.")}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div>
          <button 
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 mr-2 ${
              isLessonVisible
                ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
                : hasAnswered && selectedAnswerIndex !== null && !randomizedAnswers[selectedAnswerIndex].correct
                  ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 font-medium shadow-md transform animate-pulse-twice'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
            }`}
            onClick={handleShowLesson}
          >
            {isLessonVisible ? 'Hide Lesson' : 'Learn Topic'}
          </button>

          {hasAnswered && (
            <button 
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              onClick={handleRetry}
            >
              Retry
            </button>
          )}
        </div>

        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={handleNextQuestion}
        >
          Next Question
        </button>
      </div>
    </div>
  );
}
