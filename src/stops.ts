import type { Database } from 'better-sqlite3';
import type { CustomStop } from './gtfs.types.js';
import { point } from "@turf/turf";
import { open } from 'node:fs/promises';

export const Exclude = ["areas","attributions","calendar","calendar_attributes","calendar_dates","changes-to","fare_leg_rules","fare_media","fare_products","fare_transfer_rules","feed_info","levels","mtc_feed_versions","pathways","rider_categories","route_attributes","timeframes","transfers","shapes"];

function stopFeatureFactory(stop:CustomStop) {
  return point(
    [stop.stop_lon, stop.stop_lat],
    {
      direction_id: stop.direction_id,
      route_id: stop.route_id,
      stop_id: stop.stop_id,
      stop_name: stop.stop_name,
      stop_sequence: stop.stop_sequence,
    },
    {
      id: stop.stop_id
    }
  );
}

function getStartOfFeatureCollectionFile() {
  return `{
  "type": "FeatureCollection",
  "id": "stops",
  "features": [`;
}
function getEndOfFeatureCollectionFile() {
  return `]
}`;
}

export default async function GenerateStopsGeoJson(db:Database, outputPath:string) {
  const outputFile = await open(outputPath, 'a+');
  await outputFile.truncate();
  const outputWS = outputFile.createWriteStream();

  outputWS.on("finish", () => {
    outputWS.close();
  });

  outputWS.write(getStartOfFeatureCollectionFile());

  const statement = `
    SELECT DISTINCT routes.route_id, trips.direction_id, stops.stop_id, stop_times.stop_sequence, stops.stop_name, stops.stop_lat, stops.stop_lon
    FROM routes
    LEFT JOIN trips on trips.route_id = routes.route_id
    LEFT JOIN stop_times on stop_times.trip_id = trips.trip_id
    LEFT JOIN stops on stops.stop_id = stop_times.stop_id
    WHERE (stops.stop_lat IS NOT NULL) AND (stops.stop_lon IS NOT NULL)
    GROUP BY routes.route_id, trips.direction_id, stops.stop_id
    ORDER BY routes.route_id, trips.direction_id, stop_times.stop_sequence ASC
  `;
  const tripsStatement = db.prepare(statement);
  let firstWrite = true;
  for (const s of tripsStatement.iterate()) {
    const stop = s as CustomStop;

    if (firstWrite) {
      outputWS.write(JSON.stringify(stopFeatureFactory(stop)));
      firstWrite = false;
    } else {
      outputWS.write(',\n'+JSON.stringify(stopFeatureFactory(stop)));
    }
  }

  outputWS.write(getEndOfFeatureCollectionFile());
}