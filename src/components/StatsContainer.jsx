import React from 'react';
import useQuizStore from '../stores/quizStore';

/**
 * Stats container component that displays quiz statistics
 * @param {Object} props - Component props
 * @param {boolean} props.isMobile - Whether the component is being rendered in mobile view
 * @returns {React.ReactElement} The rendered component
 */
export default function StatsContainer({ isMobile }) {
  // Subscribe to individual stats from the store for optimal re-rendering
  const { questionsAttemptedCount, questionsCorrectCount } = useQuizStore();
  // Determine classes based on mobile/desktop view
  const containerClasses = isMobile
    ? "bg-white px-1 py-1 rounded-lg text-[10px] flex flex-nowrap justify-between items-center gap-1"
    : "flex items-center space-x-4";

  const statsContainerClasses = isMobile
    ? "flex items-center gap-1"
    : "flex items-center space-x-4";

  const attemptedClasses = isMobile
    ? "flex items-center bg-blue-50 px-1 py-1 rounded-md"
    : "flex items-center bg-blue-50 px-3 py-2 rounded-md";

  const correctClasses = isMobile
    ? "flex items-center bg-green-50 px-1 py-1 rounded-md"
    : "flex items-center bg-green-50 px-3 py-2 rounded-md";

  const iconClasses = isMobile
    ? "h-2.5 w-2.5 mr-0.5"
    : "h-4 w-4 mr-1.5";

  const labelClasses = isMobile
    ? "font-medium mr-0.5"
    : "font-medium mr-1";

  const valueClasses = isMobile
    ? "font-bold"
    : "font-bold";

  const buttonContainerClasses = isMobile
    ? "flex space-x-1"
    : "flex space-x-2";

  const statsButtonClasses = isMobile
    ? "flex items-center px-2 py-1 text-[10px] text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    : "flex items-center px-3 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";

  const resetButtonClasses = isMobile
    ? "flex items-center px-2 py-1 text-[10px] text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    : "flex items-center px-3 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2";

  const statsIconClasses = isMobile
    ? "h-2.5 w-2.5 mr-0.5"
    : "h-4 w-4 mr-1";

  // Handle reset button click
  const handleResetClick = () => {
    // Show the reset confirmation modal
    const resetConfirmationModal = document.getElementById('resetConfirmationModal');
    resetConfirmationModal?.classList.remove('hidden');
  };

  return (
    <div className={containerClasses}>
      {/* Stats divs */}
      <div className={statsContainerClasses}>
        <div className={attemptedClasses}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClasses} text-blue-500`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <span className={`${labelClasses} text-blue-700`}>Attempted:</span>
          <span className={`${valueClasses} text-blue-600`}>{questionsAttemptedCount}</span>
        </div>
        <div className={correctClasses}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClasses} text-green-500`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className={`${labelClasses} text-green-700`}>Correct:</span>
          <span className={`${valueClasses} text-green-600`}>{questionsCorrectCount}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className={buttonContainerClasses}>
        <a href="/statistics" className={statsButtonClasses}>
          <svg xmlns="http://www.w3.org/2000/svg" className={statsIconClasses} viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          Stats
        </a>
        <button onClick={handleResetClick} className={resetButtonClasses}>
          <svg xmlns="http://www.w3.org/2000/svg" className={statsIconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
      </div>
    </div>
  );
}
