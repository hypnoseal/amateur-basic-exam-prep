// scripts/sync-questions.ts
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const TEMP_DIR = path.join(process.cwd(), '.temp-questions');
const SOURCE_REPO = 'git@github.com:hypnoseal/amateur-basic-questions.git';
const SOURCE_DIR = path.join(TEMP_DIR, 'src/complete-questions');
const TARGET_DIR = path.join(process.cwd(), 'src/questions');

// Calculate file hash to compare content
async function calculateFileHash(filePath: string): Promise<string> {
    try {
        const data = await fs.readFile(filePath);
        return crypto.createHash('md5').update(data).digest('hex');
    } catch (error) {
        // If file doesn't exist or can't be read, return empty hash
        return '';
    }
}

async function syncQuestions() {
    try {
        console.log('Starting questions sync process...');

        // Create or clean temp directory
        await fs.mkdir(TEMP_DIR, { recursive: true });

        // Clone the repository to temp directory
        console.log('Cloning repository...');
        execSync(`git clone ${SOURCE_REPO} ${TEMP_DIR} --depth 1`, { stdio: 'inherit' });

        // Ensure target directory exists
        console.log('Ensuring target directory exists...');
        await fs.mkdir(TARGET_DIR, { recursive: true });

        // Get list of MDX files from source
        console.log('Reading source directory...');
        const sourceFiles = await fs.readdir(SOURCE_DIR);
        const mdxSourceFiles = sourceFiles.filter(file => file.endsWith('.mdx'));

        // Get list of existing MDX files in target
        console.log('Reading target directory...');
        const targetFiles = await fs.readdir(TARGET_DIR);
        const mdxTargetFiles = targetFiles.filter(file => file.endsWith('.mdx'));

        // Track statistics
        let newFiles = 0;
        let updatedFiles = 0;
        let unchangedFiles = 0;
        let deletedFiles = 0;

        // Process source files
        for (const file of mdxSourceFiles) {
            const sourcePath = path.join(SOURCE_DIR, file);
            const targetPath = path.join(TARGET_DIR, file);

            // Calculate hashes to compare file content
            const sourceHash = await calculateFileHash(sourcePath);
            const targetHash = await calculateFileHash(targetPath);

            if (targetHash === '') {
                // New file - doesn't exist in target
                console.log(`Adding new file: ${file}`);
                await fs.copyFile(sourcePath, targetPath);
                newFiles++;
            } else if (sourceHash !== targetHash) {
                // File exists but content is different
                console.log(`Updating modified file: ${file}`);
                await fs.copyFile(sourcePath, targetPath);
                updatedFiles++;
            } else {
                // File exists and content is identical
                console.log(`Skipping unchanged file: ${file}`);
                unchangedFiles++;
            }
        }

        // Check for files in target that don't exist in source (optional)
        const filesToDelete = mdxTargetFiles.filter(
            file => !mdxSourceFiles.includes(file)
        );

        if (filesToDelete.length > 0) {
            console.log('The following files exist in target but not in source:');
            for (const file of filesToDelete) {
                console.log(`- ${file}`);
            }

            for (const file of filesToDelete) {
                console.log(`Deleting file no longer in source: ${file}`);
                await fs.unlink(path.join(TARGET_DIR, file));
                deletedFiles++;
            }
        }

        // Summary
        console.log('\nSync Summary:');
        console.log(`- New files added: ${newFiles}`);
        console.log(`- Files updated: ${updatedFiles}`);
        console.log(`- Files unchanged: ${unchangedFiles}`);
        console.log(`- Files in target not in source: ${filesToDelete.length}`);
        if (deletedFiles > 0) {
            console.log(`- Files deleted: ${deletedFiles}`);
        }
        console.log(`Total files in source: ${mdxSourceFiles.length}`);
        console.log(`Total files in target: ${mdxTargetFiles.length + newFiles - deletedFiles}`);

        // Clean up temp directory
        console.log('\nCleaning up temporary files...');
        await fs.rm(TEMP_DIR, { recursive: true, force: true });

        console.log('Questions sync completed successfully!');
    } catch (error) {
        console.error('Error syncing questions:', error);

        // Try to clean up temp directory even if an error occurred
        try {
            await fs.rm(TEMP_DIR, { recursive: true, force: true });
        } catch (cleanupError) {
            console.error('Error cleaning up temporary files:', cleanupError);
        }
    }
}

syncQuestions();