import React, { useEffect, useRef } from 'react';
import useLessonStore from '../stores/lessonStore';

// A client-side component for displaying lesson content below the quiz card
export default function LessonContent({ content: initialContent = null }) {
  // Get state and actions from lesson store
  const { isVisible: isOpen, content, hideLesson, setContent } = useLessonStore();
  const contentRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  // Function to close the content
  const onClose = () => {
    hideLesson();
    // Dispatch a custom event for backward compatibility
    document.dispatchEvent(new CustomEvent('lesson-content-closed'));
  };

  // Initialize content if provided as prop
  useEffect(() => {
    if (initialContent && !content) {
      setContent(initialContent);
    }
  }, [initialContent, content, setContent]);

  // Listen for custom events for backward compatibility
  useEffect(() => {
    /** @type {(event: Event) => void} */
    const handleOpenLesson = (event) => {
      // Type assertion for CustomEvent
      const customEvent = /** @type {CustomEvent} */ (event);
      const { content: newContent } = customEvent.detail || {};
      setContent(newContent);
    };

    document.addEventListener('react-open-lesson-content', handleOpenLesson);

    return () => {
      document.removeEventListener('react-open-lesson-content', handleOpenLesson);
    };
  }, [setContent]);

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
    <div className="lesson-content mt-12">
      <div className="prose prose-sm md:prose lg:prose-lg max-w-none" ref={contentRef}>
        {content && typeof content === 'object' && content.nodeType ? null : content}
      </div>
      <div className="mt-4">
        <button 
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          onClick={onClose}
        >
          Hide Lesson Content
        </button>
      </div>
    </div>
  );
}
