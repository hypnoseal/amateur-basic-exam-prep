import {siteConfig} from '../config/site';
import {parseQuestionId} from './questionIdParser';

/**
 * Returns the base GitHub repository URL
 * @returns The GitHub repository URL from site configuration
 */
export function getGitHubRepoUrl(): string {
  return siteConfig.githubRepo;
}

/**
 * Generates a GitHub URL for editing a question file
 * @param questionId Question ID in the format L-CCC-SSS-### (e.g., B-001-001-001)
 * @returns GitHub edit URL for the question file or null if the ID is invalid
 */
export function getGitHubQuestionEditUrl(questionId: string): string | null {
  // Parse the question ID to validate it
  const parsedId = parseQuestionId(questionId);

  if (!parsedId) {
    return null;
  }

  // Construct the file path relative to the repository root
  const filePath = `src/questions/${questionId}.mdx`;

  // GitHub edit URLs follow the pattern:
  // https://github.com/{owner}/{repo}/edit/{branch}/{path}
  const editUrl = `${siteConfig.githubRepo}/edit/${siteConfig.githubBranch}/${filePath}`;

  return editUrl;
}

/**
 * Generates a GitHub URL for viewing a question file
 * @param questionId Question ID in the format L-CCC-SSS-### (e.g., B-001-001-001)
 * @returns GitHub view URL for the question file or null if the ID is invalid
 */
export function getGitHubQuestionViewUrl(questionId: string): string | null {
  // Parse the question ID to validate it
  const parsedId = parseQuestionId(questionId);

  if (!parsedId) {
    return null;
  }

  // Construct the file path relative to the repository root
  const filePath = `src/questions/${questionId}.mdx`;

  // GitHub view URLs follow the pattern:
  // https://github.com/{owner}/{repo}/blob/{branch}/{path}
  return `${siteConfig.githubRepo}/blob/${siteConfig.githubBranch}/${filePath}`;
}
