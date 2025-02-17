import { importGtfs, openDb } from 'gtfs';
import Database from 'better-sqlite3';

const db = new Database(':memory:');

export default async function GetGtfsDb(gtfsPath:string, exclude: string[] = []) {
  await importGtfs({
    agencies: [
      {
        path: gtfsPath,
        exclude,
      },
    ],
    db,
  });
  return db;
}