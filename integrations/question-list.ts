import type { AstroIntegration } from 'astro';
import { writeFile, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { URL } from 'node:url';

/**
 * Interface for question IDs grouped by category
 */
interface QuestionIdsByCategory {
  all: string[];
  byCategory: Record<string, string[]>;
  bySubcategory: Record<string, string[]>;
}

/**
 * Interface for a parsed question ID
 */
interface ParsedQuestionId {
  licenseLevel: 'B' | 'A';
  categoryCode: string;
  subcategoryCode: string;
  questionNumber: string;
  fullCode: string;
}

/**
 * Interface for a question
 */
interface Question {
  id: string;
  question: string;
  answers: any[];
}

/**
 * Parses a question ID in the format L-CCC-SSS-###
 * This is a simplified version of the parseQuestionId function from questionIdParser.ts
 * @param id Question ID in the format L-CCC-SSS-###
 * @returns Parsed question ID components or null if invalid format
 */
function parseQuestionId(id: string): ParsedQuestionId | null {
  // Regular expression to match the question ID format
  const regex = /^([BA])-(\d{3})-(\d{3})-(\d{3})$/;
  const match = id.match(regex);

  if (!match) {
    return null;
  }

  const [, licenseLevel, categoryCode, subcategoryCode, questionNumber] = match;

  return {
    licenseLevel: licenseLevel as 'B' | 'A',
    categoryCode,
    subcategoryCode,
    questionNumber,
    fullCode: `${categoryCode}-${subcategoryCode}`
  };
}

/**
 * Reads and parses MDX files to extract question data
 * This is a direct file system approach that doesn't rely on Vite's import.meta.glob
 * @param questionsDir Directory containing the question MDX files
 * @param logger Astro logger instance
 * @returns Array of questions with their data
 */
async function readQuestionFiles(questionsDir: string, logger: any): Promise<Question[]> {
  try {
    // Read all files in the questions directory
    const files = await readdir(questionsDir);

    // Filter for MDX files
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));

    logger.info(`Question List Integration: Found ${mdxFiles.length} MDX files`);

    // Read and parse each file
    const questions: Question[] = [];

    for (const file of mdxFiles) {
      try {
        const filePath = join(questionsDir, file);
        const content = await readFile(filePath, 'utf-8');

        // Extract frontmatter (between --- markers)
        const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

        if (frontmatterMatch && frontmatterMatch[1]) {
          const frontmatter = frontmatterMatch[1];

          // Extract id
          const idMatch = frontmatter.match(/id:\s*"([^"]+)"/);

          // Extract question
          const questionMatch = frontmatter.match(/question:\s*"([^"]+)"/);

          // Extract answers (simplified approach)
          const answersSection = frontmatter.includes('answers:') ? 
            frontmatter.substring(frontmatter.indexOf('answers:')) : '';

          if (idMatch && idMatch[1]) {
            questions.push({
              id: idMatch[1],
              question: questionMatch && questionMatch[1] ? questionMatch[1] : '',
              answers: answersSection ? [{}] : [] // We only need the ID, so this is a placeholder
            });
          }
        }
      } catch (fileError) {
        logger.warn(`Question List Integration: Error parsing file ${file}`);
        logger.warn(fileError instanceof Error ? fileError.message : String(fileError));
      }
    }

    return questions;
  } catch (error) {
    logger.error('Question List Integration: Error reading question files');
    logger.error(error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Generates empty placeholder question ID files
 * This is used during server setup when Vite module runner might not be available
 * @param outDir Directory to write the files to
 * @param logger Astro logger instance
 */
async function generateEmptyQuestionIdFiles(outDir: URL | string, logger: any): Promise<void> {
  try {
    logger.info('Question List Integration: Generating empty placeholder question ID files...');

    // Convert URL to file path if needed
    const outDirPath = typeof outDir === 'string' ? outDir : fileURLToPath(outDir);

    // Create the data directory if it doesn't exist
    if (!existsSync(outDirPath)) {
      await mkdir(outDirPath, { recursive: true });
    }

    // Write empty placeholder files
    const flatFilePath = join(outDirPath, 'question-ids.json');
    await writeFile(flatFilePath, JSON.stringify([], null, 2));

    const groupedFilePath = join(outDirPath, 'question-ids-by-category.json');
    await writeFile(groupedFilePath, JSON.stringify({ all: [], byCategory: {}, bySubcategory: {} }, null, 2));

    logger.info(`Question List Integration: Generated empty placeholder files at ${outDirPath}`);
  } catch (error) {
    logger.error('Question List Integration: Error generating empty placeholder files');
    if (error instanceof Error) {
      logger.error(error.message);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error(String(error));
    }
  }
}

/**
 * Generates question ID files and writes them to the specified directory
 * @param outDir Directory to write the files to
 * @param logger Astro logger instance
 * @param useFileSystem Whether to use the direct file system approach (true) or try dynamic imports (false)
 */
async function generateQuestionIdFiles(outDir: URL | string, logger: any, useFileSystem = false, retryCount = 0): Promise<void> {
  try {
    logger.info('Question List Integration: Generating question ID files...');

    let questions: Question[] = [];

    if (useFileSystem) {
      // Use direct file system approach to read question files
      logger.info('Question List Integration: Using direct file system approach');
      const questionsDir = resolve(process.cwd(), 'src', 'questions');
      questions = await readQuestionFiles(questionsDir, logger);
    } else {
      // Try using dynamic imports (this may fail in development)
      try {
        logger.info('Question List Integration: Attempting to use dynamic imports');
        // Dynamically import the utility functions to avoid issues with import.meta.glob
        const questionsModule = await import('../src/utils/questions.js');

        // Get all questions
        questions = questionsModule.getAllQuestions();
      } catch (importError) {
        logger.error('Question List Integration: Failed to import utility modules');
        logger.error(importError instanceof Error ? importError.message : String(importError));

        // If dynamic imports fail and we haven't tried the file system approach yet, try that
        if (!useFileSystem) {
          logger.info('Question List Integration: Falling back to direct file system approach');
          return generateQuestionIdFiles(outDir, logger, true);
        }

        // Retry logic - attempt up to 3 times with increasing delays
        if (retryCount < 3) {
          const delayMs = 1000 * (retryCount + 1); // 1s, 2s, 3s
          logger.info(`Question List Integration: Retrying import in ${delayMs/1000}s (attempt ${retryCount + 1}/3)...`);

          return new Promise(resolve => {
            setTimeout(() => {
              resolve(generateQuestionIdFiles(outDir, logger, useFileSystem, retryCount + 1));
            }, delayMs);
          });
        }

        return;
      }
    }

    if (!questions || questions.length === 0) {
      logger.warn('Question List Integration: No questions found');
      return;
    }

    logger.info(`Question List Integration: Found ${questions.length} questions`);

    // Extract just the IDs
    const questionIds = questions.map(question => question.id);

    // Group question IDs by category and subcategory
    const groupedIds = groupQuestionIdsByCategory(questions, parseQuestionId);

    // Convert URL to file path if needed
    const outDirPath = typeof outDir === 'string' ? outDir : fileURLToPath(outDir);

    // Create the data directory if it doesn't exist
    if (!existsSync(outDirPath)) {
      await mkdir(outDirPath, { recursive: true });
    }

    // Write the question IDs to JSON files
    const flatFilePath = join(outDirPath, 'question-ids.json');
    await writeFile(flatFilePath, JSON.stringify(questionIds, null, 2));

    const groupedFilePath = join(outDirPath, 'question-ids-by-category.json');
    await writeFile(groupedFilePath, JSON.stringify(groupedIds, null, 2));

    logger.info(`Question List Integration: Generated question IDs list at ${flatFilePath}`);
    logger.info(`Question List Integration: Generated grouped question IDs at ${groupedFilePath}`);
  } catch (error) {
    logger.error('Question List Integration: Error generating question IDs list');
    if (error instanceof Error) {
      logger.error(error.message);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error(String(error));
    }
  }
}

/**
 * Astro integration that generates JSON files with question IDs during build and development
 * These files will be used for client-side random question selection
 */
export default function questionListIntegration(): AstroIntegration {
  return {
    name: 'question-list-integration',
    hooks: {
      // Hook into the 'astro:config:setup' to ensure we have access to the Astro context
      'astro:config:setup': ({ logger }) => {
        logger.info('Question List Integration: Initialized');
      },

      // Generate empty placeholder files when the development server starts
      'astro:server:setup': async ({ logger }) => {
        logger.info('Question List Integration: Development server starting...');

        // In development, write to the public/data directory
        const outDir = join(process.cwd(), 'public', 'data');
        await generateEmptyQuestionIdFiles(outDir, logger);
      },

      // Generate the actual question ID files when the server is ready
      'astro:server:start': async ({ logger }) => {
        logger.info('Question List Integration: Development server started, generating question ID files...');

        // In development, write to the public/data directory
        const outDir = join(process.cwd(), 'public', 'data');

        // Delay the generation to ensure file system is ready
        setTimeout(async () => {
          try {
            // In development, use the direct file system approach by default
            // This avoids the "Vite module runner has been closed" error
            await generateQuestionIdFiles(outDir, logger, true);
          } catch (error) {
            logger.error('Question List Integration: Error in delayed question ID generation');
            logger.error(error instanceof Error ? error.message : String(error));
          }
        }, 1000); // 1 second delay is enough for file system operations
      },

      // Generate the question ID files after the build is complete
      'astro:build:done': async ({ dir, logger }) => {
        // For build, use the output directory
        const outDir = new URL('./data', dir);

        // During build, try dynamic imports first but fall back to file system if needed
        await generateQuestionIdFiles(outDir, logger, false);
      }
    }
  };
}

/**
 * Groups question IDs by category and subcategory
 * @param questions Array of questions
 * @param parseQuestionId Function to parse a question ID
 * @returns Object containing all IDs and IDs grouped by category and subcategory
 */
function groupQuestionIdsByCategory(
  questions: any[],
  parseQuestionId: (id: string) => any | null
): QuestionIdsByCategory {
  const allIds: string[] = [];
  const byCategory: Record<string, string[]> = {};
  const bySubcategory: Record<string, string[]> = {};

  questions.forEach(question => {
    const id = question.id;
    allIds.push(id);

    const parsedId = parseQuestionId(id);
    if (parsedId) {
      // Group by category
      const categoryCode = parsedId.categoryCode;
      if (!byCategory[categoryCode]) {
        byCategory[categoryCode] = [];
      }
      byCategory[categoryCode].push(id);

      // Group by subcategory (using fullCode which is category-subcategory)
      const fullCode = parsedId.fullCode;
      if (!bySubcategory[fullCode]) {
        bySubcategory[fullCode] = [];
      }
      bySubcategory[fullCode].push(id);
    }
  });

  return {
    all: allIds,
    byCategory,
    bySubcategory
  };
}
