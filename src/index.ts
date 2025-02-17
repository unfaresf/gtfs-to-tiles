import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import GenerateStopsGeoJson, { Exclude as StopsExclude } from './stops.js';
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
      describe: 'Path to writ the geojson file',
      type: 'string'
    }
  }, async ({gtfsPath, outputPath}) => {
    const db = await GetGtfsDb(gtfsPath, StopsExclude);

    await GenerateStopsGeoJson(db, outputPath);
  })
  .demandCommand(1)
  .help()
  .argv
