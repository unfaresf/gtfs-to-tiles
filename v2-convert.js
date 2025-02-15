import gtfsToGeoJSON from 'gtfs-to-geojson';
import { readFileSync } from 'node:fs';

const config = JSON.parse(
  readFileSync('./config.json', {encoding: 'utf8'})
);

gtfsToGeoJSON(config)
  .then(() => {
    console.log('GeoJSON Generation Successful');
  })
  .catch((err) => {
    console.error(err);
  });