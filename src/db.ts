import { importGtfs, openDb, type TableNames } from 'gtfs';
import Database from 'better-sqlite3';
import { existsSync } from 'fs';

export default async function GetGtfsDb(gtfsPath:string, exclude: string[] = [], databasePath?:string) {
  const db = databasePath ? new Database(databasePath) : new Database(':memory:');

  if (databasePath && existsSync(databasePath)) return db;

  await importGtfs({
    agencies: [
      {
        path: gtfsPath,
        // gtfs >=4.19 narrowed `exclude` from string[] to TableNames[]. Our
        // lists are user-facing filename filters (and include a few
        // non-standard files the importer simply ignores), so assert here.
        exclude: exclude as TableNames[],
      },
    ],
    db
  });
  return db;
}