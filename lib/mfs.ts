import { promisify } from 'util';
import * as fs from 'fs';
import * as nodepath from 'path';
import { filterAsync } from 'node-filter-async';

export const writeFileAsync = promisify(fs.writeFile);
export const readFileAsync = promisify(fs.readFile);
export const statAsync = promisify(fs.stat);
export const readdirAsync = promisify(fs.readdir);

export async function readTextFileAsync(path: string): Promise<string> {
  return await readFileAsync(path, 'utf8');
}

export async function statOrNullAsync(path: string): Promise<fs.Stats|null> {
  try {
    return await statAsync(path);
  } catch {
    return null;
  }
}

export async function fileExists(path: string): Promise<boolean> {
  const stat = await statOrNullAsync(path);
  if (stat && stat.isFile()) {
    return true;
  }
  return false;
}

export async function dirExists(path: string): Promise<boolean> {
  const stat = await statOrNullAsync(path);
  if (stat && stat.isDirectory()) {
    return true;
  }
  return false;
}

export const listSubPaths = readdirAsync;

export async function listSubDirs(dir: string): Promise<string[]> {
  const paths: string[] = await readdirAsync(dir);
  const dirs = await filterAsync(paths, async (path) => {
    const stat = await statAsync(nodepath.join('./data', path));
    return stat.isDirectory();
  });
  return dirs;
}

export async function listSubFiles(dir: string): Promise<string[]> {
  const paths: string[] = await readdirAsync(dir);
  const dirs = await filterAsync(paths, async (path) => {
    const stat = await statAsync(nodepath.join('./data', path));
    return stat.isFile();
  });
  return dirs;
}
