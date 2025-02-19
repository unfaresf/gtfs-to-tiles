import { importGtfs, openDb } from 'gtfs';
import Database from 'better-sqlite3';
import { existsSync } from 'fs';

export default async function GetGtfsDb(gtfsPath:string, exclude: string[] = [], databasePath?:string) {
  const db = databasePath ? new Database(databasePath) : new Database(':memory:');

  if (databasePath && existsSync(databasePath)) return db;

  await importGtfs({
    agencies: [
      {
        path: gtfsPath,
        exclude,
      },
    ],
    db
  });
  return db;
}