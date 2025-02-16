import gtfsToGeoJSON from 'gtfs-to-geojson';
import { readFileSync } from 'node:fs';

const [execPath, jsPath, dataType] = process.argv;


const config = JSON.parse(
  readFileSync(`./config-${dataType}.json`, {encoding: 'utf8'})
);

gtfsToGeoJSON(config)
  .then(() => {
    console.log('GeoJSON Generation Successful');
  })
  .catch((err) => {
    console.error(err);
  });