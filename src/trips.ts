import type { Database } from 'better-sqlite3';
import type { CustomTrip } from './gtfs.types.js';
import { lineString } from "@turf/turf";
import { open } from 'node:fs/promises';

export const Exclude = ["areas","attributions","calendar","calendar_attributes","calendar_dates","changes-to","fare_leg_rules","fare_media","fare_products","fare_transfer_rules","feed_info","levels","mtc_feed_versions","pathways","rider_categories","route_attributes","stop_times","timeframes","transfers"];

function tripFeatureFactory(trip:CustomTrip) {
  return lineString(
    trip.line,
    {
      agency_id: trip.agency_id,
      direction_id: trip.direction_id,
      route_color: trip.route_color,
      route_id: trip.route_id,
      route_long_name: trip.route_long_name,
      route_short_name: trip.route_short_name,
      route_text_color: trip.route_text_color,
      shape_id: trip.shape_id,
      trip_id: trip.trip_id
    },
    {
      id: trip.trip_id
    }
  );
}

function getStartOfFeatureCollectionFile() {
  return `{
  "type": "FeatureCollection",
  "id": "trips",
  "features": [`;
}

function getEndOfFeatureCollectionFile() {
  return `]
}`;
}

export default async function GenerateTripsGeoJson(db:Database, outputPath:string) {
  const outputFile = await open(outputPath, 'a+');
  await outputFile.truncate();
  const outputWS = outputFile.createWriteStream();

  outputWS.on("finish", () => {
    outputWS.close();
  });

  outputWS.write(getStartOfFeatureCollectionFile());

  const statement = `
    SELECT DISTINCT
      routes.route_id,
      routes.agency_id,
      routes.route_short_name,
      routes.route_long_name,
      routes.route_color,
      routes.route_text_color,
      trips.trip_id,
      trips.direction_id,
      meta_shapes.shape_id,
      meta_shapes.line
    FROM routes
    INNER JOIN trips ON trips.route_id = routes.route_id
    INNER JOIN (
      SELECT
        shape_id,
        '[' || GROUP_CONCAT('[' || shapes.shape_pt_lon || ',' || shapes.shape_pt_lat || ']', ',') || ']' as line
      FROM shapes
      WHERE shapes.shape_pt_lat IS NOT NULL
      AND shapes.shape_pt_lon IS NOT NULL
      GROUP BY shapes.shape_id
      ORDER BY shapes.shape_pt_sequence ASC
    ) AS meta_shapes
    ON meta_shapes.shape_id = trips.shape_id
    GROUP BY routes.route_id, trips.direction_id
  `;
  const tripsStatement = db.prepare(statement);
  let firstWrite = true;
  for (const r of tripsStatement.iterate()) {
    // @ts-ignore
    r.line = JSON.parse(r.line);
    const trip = r as CustomTrip;

    if (firstWrite) {
      outputWS.write(JSON.stringify(tripFeatureFactory(trip)));
      firstWrite = false;
    } else {
      outputWS.write(',\n'+JSON.stringify(tripFeatureFactory(trip)));
    }
  }

  outputWS.write(getEndOfFeatureCollectionFile());
}