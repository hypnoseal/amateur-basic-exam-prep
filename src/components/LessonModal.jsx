import React, { useEffect, useState, useCallback, useRef } from 'react';

// A client-side modal component for displaying lesson content
export default function LessonModal({ isOpen: initialIsOpen = false, onClose: initialOnClose = () => {}, content: initialContent = null }) {
  // Use state to manage props that might be updated from outside
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [content, setContent] = useState(initialContent);
  const contentRef = useRef(null);

  // Function to close the modal - memoized to prevent unnecessary re-renders
  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Listen for custom events to control the modal
  useEffect(() => {
    const handleOpenModal = (event) => {
      const { content: newContent } = event.detail || {};
      setContent(newContent);
      setIsOpen(true);
    };

    document.addEventListener('react-open-lesson-modal', handleOpenModal);

    return () => {
      document.removeEventListener('react-open-lesson-modal', handleOpenModal);
    };
  }, []);
  useEffect(() => {
    // Close modal when pressing Escape key
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle DOM node content
  useEffect(() => {
    if (content && typeof content === 'object' && content.nodeType && contentRef.current) {
      // Clear previous content
      contentRef.current.innerHTML = '';
      // Append the DOM node
      contentRef.current.appendChild(content);
    }
  }, [content]);

  // Don't render anything if the modal is not open
  if (!isOpen) return null;

  // Handle click outside the modal content
  const handleModalClick = (event) => {
    if (event.target.id === 'lessonModal') {
      onClose();
    }
  };

  return (
    <div 
      id="lessonModal" 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:p-0"
      onClick={handleModalClick}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Lesson</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1"
            aria-label="Close"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto prose prose-sm md:prose lg:prose-lg max-w-none" ref={contentRef}>
          {content && typeof content === 'object' && content.nodeType ? null : content}
        </div>
      </div>
    </div>
  );
}
