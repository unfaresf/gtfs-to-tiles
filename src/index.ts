import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import GenerateStopsGeoJson, { Exclude as StopsExclude } from './stops.js';
import GenerateTripsGeoJson, { Exclude as TripsExclude } from './trips.js';
import GetGtfsDb from './db.js';

yargs(hideBin(process.argv))
  .command('stops', 'Generate GeoJSON of stops in GTFS', {
    'gtfs-path': {
      alias: 'p',
      demandOption: true,
      describe: 'Path to your GTFS .zip file',
      type: 'string'
    },
    'output-path': {
      alias: 'o',
      demandOption: true,
      describe: 'Path to write the geojson file',
      type: 'string'
    },
    'database-path': {
      alias: 'd',
      demandOption: false,
      describe: 'Path to optional sqlite file. If omitted, in-memory database will be used',
      type: 'string'
    }
  }, async ({gtfsPath, outputPath, databasePath}) => {
    const db = await GetGtfsDb(gtfsPath, StopsExclude, databasePath);

    const outputFilePath = await GenerateStopsGeoJson(db, outputPath);
    console.log(outputFilePath);
  })
  .command('trips', 'Generate GeoJSON of trips in GTFS', {
    'gtfs-path': {
      alias: 'p',
      demandOption: true,
      describe: 'Path to your GTFS .zip file',
      type: 'string'
    },
    'output-path': {
      alias: 'o',
      demandOption: true,
      describe: 'Path to write the geojson file',
      type: 'string'
    },
    'database-path': {
      alias: 'd',
      demandOption: false,
      describe: 'Path to optional sqlite file. If omitted, in-memory database will be used',
      type: 'string'
    }
  }, async ({gtfsPath, outputPath, databasePath}) => {
    const db = await GetGtfsDb(gtfsPath, TripsExclude, databasePath);

    const outputFilePath = await GenerateTripsGeoJson(db, outputPath);
    console.log(outputFilePath);
  })
  .demandCommand(1)
  .help()
  .argv
