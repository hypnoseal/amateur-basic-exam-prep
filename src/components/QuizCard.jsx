import React, { useState, useEffect } from 'react';

// A client-side component for displaying a quiz question
export default function QuizCard({ id, question, answers, onShowLesson }) {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [randomizedAnswers, setRandomizedAnswers] = useState([]);
  const [isAttempted, setIsAttempted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLessonVisible, setIsLessonVisible] = useState(false);
  const letters = ['A', 'B', 'C', 'D'];

  // Randomize answers when component mounts or when answers change
  useEffect(() => {
    // Create a copy of the answers array to avoid mutating the original
    const answersCopy = [...answers];

    // Fisher-Yates shuffle algorithm
    for (let i = answersCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answersCopy[i], answersCopy[j]] = [answersCopy[j], answersCopy[i]];
    }

    setRandomizedAnswers(answersCopy);
  }, [answers]);

  // Check if the current question is in the attempted or correctly answered questions arrays
  useEffect(() => {
    if (id) {
      // Get the arrays from localStorage
      const attemptedQuestions = JSON.parse(localStorage.getItem('attemptedQuestions') || '[]');
      const correctlyAnsweredQuestions = JSON.parse(localStorage.getItem('correctlyAnsweredQuestions') || '[]');

      // Update state based on whether the current question ID is in the arrays
      setIsAttempted(attemptedQuestions.includes(id));
      setIsCorrect(correctlyAnsweredQuestions.includes(id));
    }
  }, [id]);

  // Listen for the lesson-content-closed event
  useEffect(() => {
    const handleLessonClosed = () => {
      setIsLessonVisible(false);
    };

    document.addEventListener('lesson-content-closed', handleLessonClosed);

    return () => {
      document.removeEventListener('lesson-content-closed', handleLessonClosed);
    };
  }, []);

  // Handle answer selection
  const handleAnswerClick = (index) => {
    if (hasAnswered) return; // Prevent multiple selections

    setHasAnswered(true);
    setSelectedAnswerIndex(index);
    const isCorrect = randomizedAnswers[index].correct;

    // Get the array of attempted questions
    let attemptedQuestions = JSON.parse(localStorage.getItem('attemptedQuestions') || '[]');

    // Only add the ID if it's not already in the array
    if (!attemptedQuestions.includes(id)) {
      attemptedQuestions.push(id);
      localStorage.setItem('attemptedQuestions', JSON.stringify(attemptedQuestions));
    }

    // Update isAttempted state
    setIsAttempted(true);

    // Get the array of correctly answered questions
    let correctlyAnsweredQuestions = JSON.parse(localStorage.getItem('correctlyAnsweredQuestions') || '[]');

    if (randomizedAnswers[index].correct) {
      // Only add the ID if it's not already in the array
      if (!correctlyAnsweredQuestions.includes(id)) {
        correctlyAnsweredQuestions.push(id);
        localStorage.setItem('correctlyAnsweredQuestions', JSON.stringify(correctlyAnsweredQuestions));
      }

      // Update isCorrect state
      setIsCorrect(true);
    }

    // Update localStorage for backward compatibility
    localStorage.setItem('questionsAttempted', attemptedQuestions.length.toString());

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

  // Handle next question button click
  const handleNextQuestion = () => {
    // Navigate to the quiz route to get a new random question
    window.location.href = '/quiz';
  };

  // Handle show lesson button click
  const handleShowLesson = () => {
    if (isLessonVisible) {
      // If lesson is already visible, hide it
      handleHideLesson();
      return;
    }

    // Dispatch a custom event to show the lesson
    document.dispatchEvent(new CustomEvent('showLesson', {
      detail: { questionId: id }
    }));

    // Also call the onShowLesson prop if provided
    if (onShowLesson) {
      onShowLesson(id);
    }

    // Set the lesson as visible
    setIsLessonVisible(true);

    // Add a small delay to ensure the LessonContent component is rendered
    setTimeout(() => {
      // Find the lesson-content element and scroll to it smoothly
      const lessonContent = document.querySelector('.lesson-content');
      if (lessonContent) {
        // Custom smooth scroll function with slower animation
        const scrollToElement = (element) => {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const startPosition = window.pageYOffset;
          const distance = elementPosition - startPosition;
          const duration = 1000; // Longer duration for slower animation (in ms)
          let startTime = null;

          const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const scrollY = easeInOutCubic(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, scrollY);

            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          };

          // Easing function for smoother animation
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
    // Dispatch a custom event to hide the lesson
    document.dispatchEvent(new CustomEvent('react-close-lesson-content'));

    // Set the lesson as not visible
    setIsLessonVisible(false);
  };

  // Handle retry button click
  const handleRetry = () => {
    // Reset the question state
    setHasAnswered(false);
    setSelectedAnswerIndex(null);
  };

  return (
    <div className="quiz-card bg-white rounded-lg shadow-md p-6 mb-6 relative" data-lesson={id}>
      {/* Status icon in top right corner */}
      {isCorrect && (
        <div className="absolute top-2 right-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {isAttempted && !isCorrect && (
        <div className="absolute top-2 right-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      )}
      <div className="mb-2 text-sm text-gray-500">Question ID: {id}</div>
      <h2 className="text-xl font-semibold mb-6">{question}</h2>

      <div className="answers-container">
        {randomizedAnswers.length > 0 && randomizedAnswers.map((answer, index) => (
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
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-2"
            onClick={handleNextQuestion}
          >
            Next Question
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
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
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
      </div>
    </div>
  );
}
