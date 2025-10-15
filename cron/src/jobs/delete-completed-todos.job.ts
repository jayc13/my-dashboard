import { getSDK } from '@/utils/sdk';

/**
 * Delete Completed Todos Job
 * 
 * This job deletes all completed to-do items from the database.
 * It helps keep the to-do list clean by removing tasks that have been marked as completed.
 */
const deleteCompletedTodosJob = async (): Promise<void> => {
  console.log('='.repeat(60));
  console.log('Running Delete Completed Todos Job...');
  console.log('='.repeat(60));

  try {
    const sdk = await getSDK();
    
    // Fetch all todos
    console.log('[1/3] Fetching all to-do items...');
    const todos = await sdk.todos.getTodos();
    console.log(`✓ Successfully fetched ${todos.length} to-do item(s)`);

    // Filter completed todos
    const completedTodos = todos.filter(todo => todo.isCompleted);
    console.log(`  - Completed todos: ${completedTodos.length}`);

    if (completedTodos.length === 0) {
      console.log('  ℹ️  No completed todos to delete');
      console.log('='.repeat(60));
      console.log('✓ Delete Completed Todos Job completed successfully');
      console.log('='.repeat(60));
      return;
    }

    // Delete completed todos
    console.log(`\n[2/3] Deleting ${completedTodos.length} completed todo(s)...`);
    let successCount = 0;
    let failureCount = 0;

    for (const todo of completedTodos) {
      try {
        if (todo.id) {
          await sdk.todos.deleteTodo(todo.id);
          console.log(`  ✓ Deleted todo #${todo.id}: "${todo.title}"`);
          successCount++;
        }
      } catch (error) {
        console.error(`  ❌ Error deleting todo #${todo.id}:`, error);
        failureCount++;
      }
    }

    // Summary
    console.log('\n[3/3] Deletion Summary:');
    console.log(`  - Successfully deleted: ${successCount}`);
    console.log(`  - Failed to delete: ${failureCount}`);

    console.log('\n' + '='.repeat(60));
    console.log('✓ Delete Completed Todos Job completed successfully');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error running Delete Completed Todos Job:', error);
    console.log('='.repeat(60));
  }
};

export default deleteCompletedTodosJob;

