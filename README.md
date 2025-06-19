

# Amateur Radio Exam Prep

This project is an exam preparation tool for Canadian ISED basic amateur radio licensing exams.

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

## Dependencies

- Astro
- React
- Tailwind CSS
- @tailwindcss/typography (for markdown styling)
- Pagefind (for static site search)

## Contributing

We welcome contributions from the community, especially from radio experts and amateur radio enthusiasts who can help improve the quality and accuracy of our lesson content.

### Who Can Contribute

- **Radio Experts**: If you have professional experience in radio communications, your technical expertise is invaluable for reviewing and enhancing our lesson content.
- **Amateur Radio Enthusiasts**: Licensed ham radio operators can provide practical insights and real-world applications.
- **Educators**: Those with experience in teaching technical subjects can help improve the clarity and educational value of our content.
- **Developers**: Frontend developers can contribute to the codebase, improve UI/UX, and add new features.

### Areas Where We Need Help

1. **Lesson Content Review**: Review existing lessons for technical accuracy, clarity, and completeness.
2. **Content Creation**: Create new lessons for questions that don't have detailed explanations yet.
3. **Content Enhancement**: Add diagrams, examples, and practical applications to existing lessons.
4. **Technical Improvements**: Enhance the application's functionality and user experience.

### How to Contribute

1. **Fork the Repository**: Create your own copy of the project.
2. **Set Up Locally**: Follow the installation instructions above to set up the project on your machine.
3. **Make Changes**:
   - For content contributions: Edit or create MDX files in the `src/questions` directory.
   - For code contributions: Make your changes to the relevant files.
4. **Test Your Changes**: Run the development server and ensure everything works as expected.
5. **Submit a Pull Request**: Push your changes to your fork and submit a pull request to the main repository.

### Guidelines for Content Contributors

- **Question Files**: Each question is stored as an MDX file in the `src/questions` directory, named with the question ID (e.g., `B-001-020-002.mdx`).
- **File Structure**:
  - Frontmatter: Contains question ID, question text, and multiple-choice answers with explanations.
  - Lesson Content: Structured with headings, learning objectives, explanations, examples, and key takeaways.
- **Content Quality**:
  - Ensure technical accuracy and adherence to amateur radio regulations.
  - Use clear, concise language suitable for learners.
  - Include practical examples and applications where possible.
  - Add diagrams or illustrations for complex concepts (images can be placed in the `public` directory).

### Code of Conduct

- Be respectful and constructive in your contributions and communications.
- Focus on improving the educational value and accuracy of the content.
- Acknowledge the work of others and collaborate effectively.

We appreciate your interest in contributing to this project and helping the amateur radio community!
