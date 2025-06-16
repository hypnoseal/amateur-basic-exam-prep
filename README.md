

# Amateur Radio Exam Prep

This project is an exam preparation tool for amateur radio licensing exams.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Features

- Interactive quiz questions
- Lesson content for each question
- Responsive design for mobile and desktop
- Full-text search for questions and lesson content

## Recent Changes

### Direct Question Access

A new feature has been added to allow users to directly access specific questions in two ways:

1. **URL-based access**: Users can now enter a question ID in the URL to go directly to that question:
   - For quiz mode: `/quiz/[question-id]` (e.g., `/quiz/B-005-001-005`)
   - For study mode: `/question/[question-id]` (e.g., `/question/B-005-001-005`)

2. **Dropdown selection**: A dropdown menu in the top navigation bar allows users to select and navigate to specific questions:
   - Click on "Select Question" in the top navigation
   - Choose a question from the dropdown list
   - The page will navigate to the selected question in quiz mode

This makes it easier to:
- Share links to specific questions
- Return to questions you want to review
- Create custom study paths through the material
- Implement features like bookmarking or question lists

### Search Functionality

A new search feature has been added to the top navigation bar, allowing users to search for questions by ID or content. The search is powered by Pagefind, which creates a search index at build time, making it work even when the site is hosted as a static site.

Features of the search:
- Search by question ID (e.g., "B-005-001-005")
- Search by question content
- Search by lesson content
- Results show the question title and a snippet of the matching content
- Clicking a result takes you directly to the question page

To use the search:
1. Click on the search bar in the top navigation
2. Type your search query
3. Results will appear in a dropdown below the search bar
4. Click on a result to go to that question

Note: The search index is built during the build process, so new content will only be searchable after rebuilding the site.

### Markdown Rendering in Lesson Modal

The LessonModal component now properly renders markdown content using Tailwind's Typography plugin. This ensures that lesson content with markdown formatting (headers, lists, etc.) is displayed correctly.

To see these changes in action:
1. Open a quiz question
2. Click on the "Show Lesson" button
3. The lesson content should now display with proper markdown formatting

## Dependencies

- Astro
- React
- Tailwind CSS
- @tailwindcss/typography (for markdown styling)
- Pagefind (for static site search)
