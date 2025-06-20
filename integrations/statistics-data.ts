import type { AstroIntegration } from 'astro';
import { writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

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
 * Interface for category statistics
 */
interface CategoryStats {
  code: string;
  title: string;
  questionCount: number;
}

/**
 * Interface for statistics data
 */
interface StatisticsData {
  totalQuestions: number;
  categories: CategoryStats[];
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
 * Generates statistics data and writes it to the specified directory
 * @param outDir Directory to write the file to
 * @param logger Astro logger instance
 */
async function generateStatisticsData(outDir: string | URL, logger: any): Promise<void> {
  try {
    logger.info('Statistics Data Integration: Generating statistics data...');

    // Convert URL to file path if needed
    const outDirPath = typeof outDir === 'string' ? outDir : fileURLToPath(outDir);

    // Create the data directory if it doesn't exist
    if (!existsSync(outDirPath)) {
      await mkdir(outDirPath, { recursive: true });
    }

    // Read categories data
    const categoriesPath = resolve(process.cwd(), 'src', 'data', 'categories.json');
    const categoriesData = JSON.parse(await readFile(categoriesPath, 'utf-8'));

    // Try to get all questions
    let questions: Question[] = [];
    try {
      // Try using dynamic imports
      const questionsModule = await import('../src/utils/questions.js');
      questions = questionsModule.getAllQuestions();
    } catch (importError) {
      logger.error('Statistics Data Integration: Failed to import questions module');
      logger.error(importError instanceof Error ? importError.message : String(importError));
      
      // Fallback to reading question IDs from the generated file
      try {
        const questionIdsPath = join(outDirPath, 'question-ids.json');
        if (existsSync(questionIdsPath)) {
          const questionIds = JSON.parse(await readFile(questionIdsPath, 'utf-8'));
          questions = questionIds.map((id: string) => ({ id, question: '', answers: [] }));
          logger.info(`Statistics Data Integration: Using ${questions.length} question IDs from question-ids.json`);
        } else {
          logger.error('Statistics Data Integration: question-ids.json not found');
          return;
        }
      } catch (fallbackError) {
        logger.error('Statistics Data Integration: Failed to read question IDs');
        logger.error(fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
        return;
      }
    }

    // Calculate statistics
    const totalQuestions = questions.length;
    
    // Initialize category stats
    const categories: CategoryStats[] = categoriesData.map((category: any) => ({
      code: category.code,
      title: category.title,
      questionCount: 0
    }));

    // Count questions per category
    questions.forEach((question) => {
      const parsed = parseQuestionId(question.id);
      if (parsed) {
        const { categoryCode } = parsed;
        const categoryIndex = categories.findIndex(cat => cat.code === categoryCode);
        if (categoryIndex !== -1) {
          categories[categoryIndex].questionCount++;
        }
      }
    });

    // Create statistics data object
    const statisticsData: StatisticsData = {
      totalQuestions,
      categories
    };

    // Write statistics data to JSON file
    const statisticsFilePath = join(outDirPath, 'statistics.json');
    await writeFile(statisticsFilePath, JSON.stringify(statisticsData, null, 2));

    logger.info(`Statistics Data Integration: Generated statistics data at ${statisticsFilePath}`);
  } catch (error) {
    logger.error('Statistics Data Integration: Error generating statistics data');
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
 * Astro integration that generates statistics data during build and development
 */
export default function statisticsDataIntegration(): AstroIntegration {
  return {
    name: 'statistics-data-integration',
    hooks: {
      // Hook into the 'astro:config:setup' to ensure we have access to the Astro context
      'astro:config:setup': ({ logger }) => {
        logger.info('Statistics Data Integration: Initialized');
      },

      // Generate statistics data when the development server starts
      'astro:server:start': async ({ logger }) => {
        logger.info('Statistics Data Integration: Development server started, generating statistics data...');

        // In development, write to the public/data directory
        const outDir = join(process.cwd(), 'public', 'data');

        // Delay the generation to ensure file system is ready
        setTimeout(async () => {
          try {
            await generateStatisticsData(outDir, logger);
          } catch (error) {
            logger.error('Statistics Data Integration: Error in delayed statistics data generation');
            logger.error(error instanceof Error ? error.message : String(error));
          }
        }, 1000); // 1 second delay
      },

      // Generate the statistics data after the build is complete
      'astro:build:done': async ({ dir, logger }) => {
        // For build, use the output directory
        const outDir = new URL('./data', dir);

        // Generate statistics data
        await generateStatisticsData(outDir, logger);
      }
    }
  };
}