import React, { useEffect, useState, useCallback, useRef } from 'react';

// A client-side component for displaying lesson content below the quiz card
export default function LessonContent({ isOpen: initialIsOpen = false, onClose: initialOnClose = () => {}, content: initialContent = null }) {
  // Use state to manage props that might be updated from outside
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [content, setContent] = useState(initialContent);
  const contentRef = useRef(null);

  // Function to close the content - memoized to prevent unnecessary re-renders
  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Listen for custom events to control the content display
  useEffect(() => {
    const handleOpenLesson = (event) => {
      const { content: newContent } = event.detail || {};
      setContent(newContent);
      setIsOpen(true);
    };

    document.addEventListener('react-open-lesson-content', handleOpenLesson);

    return () => {
      document.removeEventListener('react-open-lesson-content', handleOpenLesson);
    };
  }, []);

  // Handle DOM node content
  useEffect(() => {
    if (content && typeof content === 'object' && content.nodeType && contentRef.current) {
      // Clear previous content
      contentRef.current.innerHTML = '';
      // Append the DOM node
      contentRef.current.appendChild(content);
    }
  }, [content]);

  // Don't render anything if the content is not open
  if (!isOpen) return null;

  return (
    <div className="lesson-content mt-4">
      <div className="prose prose-sm md:prose lg:prose-lg max-w-none" ref={contentRef}>
        {content && typeof content === 'object' && content.nodeType ? null : content}
      </div>
      <div className="mt-4">
        <button 
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          onClick={onClose}
        >
          Hide Content
        </button>
      </div>
    </div>
  );
}