/**
 * Utility functions for managing task revisions
 */

import { revisionService, taskService } from './supabase-service';

/**
 * Create initial revisions for all tasks that don't have any revisions yet.
 * This is useful for backfilling revision history for existing tasks.
 *
 * @param userId - The user ID to process tasks for
 * @returns Object containing success count and any errors
 */
export async function createMissingInitialRevisions(userId: string): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const result = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Get all tasks for the user
    const tasks = await taskService.getTasks(userId);

    for (const task of tasks) {
      // Skip tasks without content
      if (!task.content || task.content.trim() === '') {
        continue;
      }

      try {
        // Check if task already has revisions
        const existingRevisions = await revisionService.getTaskRevisions(task.id);

        if (existingRevisions.length === 0) {
          // Create initial revision
          await revisionService.createRevision(
            task.id,
            userId,
            task.content,
            'ai-generated',
            'Initial Version'
          );

          result.success++;
          console.log(`✓ Created initial revision for task: ${task.title}`);
        }
      } catch (error) {
        result.failed++;
        const errorMsg = `Failed to create revision for task ${task.id}: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`\nRevision backfill complete:`);
    console.log(`- Successfully created: ${result.success}`);
    console.log(`- Failed: ${result.failed}`);

    return result;
  } catch (error) {
    console.error('Error in createMissingInitialRevisions:', error);
    throw error;
  }
}

/**
 * Check if a task needs an initial revision created
 *
 * @param taskId - The task ID to check
 * @returns True if the task needs an initial revision
 */
export async function needsInitialRevision(taskId: string): Promise<boolean> {
  try {
    const revisions = await revisionService.getTaskRevisions(taskId);
    return revisions.length === 0;
  } catch (error) {
    console.error('Error checking if task needs initial revision:', error);
    return false;
  }
}

/**
 * Ensure a task has at least one revision.
 * If not, create the initial revision.
 *
 * @param taskId - The task ID
 * @param userId - The user ID
 * @param content - The task content
 * @returns The revision (existing or newly created)
 */
export async function ensureTaskHasRevision(
  taskId: string,
  userId: string,
  content: string
): Promise<any> {
  try {
    const revisions = await revisionService.getTaskRevisions(taskId);

    if (revisions.length > 0) {
      return revisions[0]; // Return existing revision
    }

    // Create initial revision
    if (content && content.trim() !== '') {
      const initialRevision = await revisionService.createRevision(
        taskId,
        userId,
        content,
        'ai-generated',
        'Initial Version'
      );

      console.log(`Created initial revision for task ${taskId}`);
      return initialRevision;
    }

    return null;
  } catch (error) {
    console.error('Error ensuring task has revision:', error);
    throw error;
  }
}
