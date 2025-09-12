import { API_BASE_URL } from '../utils/constants';
import { apiFetch } from '../utils/helpers';

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const DAY_TO_KEEP = 7;

interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: number;
  modified?: Date;
}

interface DirectoryListing {
  path: string;
  items: FileSystemItem[];
  totalFiles: number;
  totalDirectories: number;
}

interface InternalFileSystem {
  success: boolean;
  data?: DirectoryListing;
  error?: Error;
  deletedFiles?: string[];
  failedDeletions?: string[];
}

const cleanUpDataFilesJob = async (): Promise<void> => {
  console.log('Starting clean-up-data-files job...');

  let result: InternalFileSystem | undefined = undefined;
  // Call the API to get all data files
  try {
    const res = await apiFetch(`${API_BASE_URL}/api/internal/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Error running clean-up-data-files job');
      return;
    }

    result = await res.json();
  } catch (error) {
    console.error('Error running clean-up-data-files job:', error);
  }

  if (!result || !result.data || !result.data.items) {
    console.log('No data files found to process.');
    return;
  }

  // Filter out files that were not deleted
  const deletedFiles = [];
  const failedDeletions = [];

  const directories = result.data.items.filter((item: { type: string; }) => item.type === 'directory');
  console.log(`Found ${directories.length} directories to process.`);

  const today = new Date();

  // Iterate the results
  for (const folder of directories) {
    const A = new Date(folder.name);
    // Calculate the difference in days
    const diffDays = (today.getTime() - A.getTime()) / MS_IN_DAY;

    if (diffDays >= DAY_TO_KEEP) {
      // Call the API to delete the folder
      try {
        const deleteRes = await apiFetch(`${API_BASE_URL}/api/internal/files?path=${folder.path}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!deleteRes.ok) {
          console.error(`Error deleting folder ${folder.name}`);
          failedDeletions.push(folder.name);
        } else {
          console.log(` ✅ ${folder.name}`);
          deletedFiles.push(folder.name);
        }
      } catch (error) {
        console.error(`Error deleting folder ${folder.name}:`, error);
        failedDeletions.push(folder.name);
      }
    }
  }

  // Log the results
  console.log(`Clean-up-data-files job completed. Deleted files: ${deletedFiles.length}, Failed deletions: ${failedDeletions.length}`);
  if (failedDeletions.length > 0) {
    console.error('Failed to delete the following files:');
    failedDeletions.forEach((file: string) => console.error(`- ${file}`));
  }
};

export default cleanUpDataFilesJob;