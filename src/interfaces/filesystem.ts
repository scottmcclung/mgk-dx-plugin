import { Stats } from 'fs';

/**
 * Filesystem interface for dependency injection
 * Allows for easy mocking in tests
 */
export interface IFileSystem {
  statSync(path: string): Stats;
  accessSync(path: string, mode?: number): void;
  constants: {
    W_OK: number;
  };
}
