import { createWriteStream, existsSync } from 'fs';
import AdmZip from 'adm-zip';
import type { Entries, Shape, Trip } from './convert-gtfs-to-geojson.types';

function processBytestrLine(l: string): string[] {
  return l.replace('\r\n', '').split(',');
}

function generateLineFeature(coords: number[][], shape_id:string, route_id:string, direction_id:string) {
  const feat = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coords,
    },
    properties: {
      shape_id,
      route_id,
      direction_id,
    },
  };
  return feat;
}

type RouteShapeDictValue = {
  routeId:string,
  directionId:string,
};

function createShapeToRouteDict(zip:AdmZip, tripsFilePath:AdmZip.IZipEntry):Map<string, RouteShapeDictValue> {
  const routesToShape:Map<string, RouteShapeDictValue> = new Map();
  const tripsFileContent = zip.readAsText(tripsFilePath); // Buffer, not a stream.
  const lines = tripsFileContent.split('\n');
  const headers = processBytestrLine(lines[0]);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const data = {};
    const values = processBytestrLine(line);
    for (let j = 0; j < headers.length; j++) {
      data[headers[j]] = values[j];
    }
    const d = data as Trip;

    routesToShape.set(d.shape_id, {routeId: d.route_id, directionId: d.direction_id});
  }

  return routesToShape;
}

async function processGTFS(zipFilePath: string, outputFilePath: string) {
  const zip = new AdmZip(zipFilePath);
  const zipEntries = zip.getEntries();
  const entries:Entries = {};

  for (const entry of zipEntries) {
    if (entry.entryName === 'shapes.txt') {
      entries.shapes = entry;
    }
    if (entry.entryName === 'stops.txt') {
      entries.stops = entry;
    }
    if (entry.entryName === 'trips.txt') {
      entries.trips = entry;
    }
  }

  if (Object.entries(entries).length !== 3) {
    throw new Error('Missing files from GTFS.');
  }
  const shapeToRouteDict = createShapeToRouteDict(zip, entries.trips);
  const shapeFileContent = zip.readAsText(entries.shapes); // Buffer, not a stream.
  const lines = shapeFileContent.split('\n');
  const headers = processBytestrLine(lines[0]);

  const fileStream = createWriteStream(outputFilePath);

  fileStream.write('{"type": "FeatureCollection", "features": [\n');

  let currShapeId: string | null = null;
  let currCoords: number[][] = [];
  const seenDirectedRouteIds = new Set();
  for (let i = 1; i < lines.length; i++) { // Start from index 1 to skip header
    const line = lines[i];
    if (!line) continue; // Skip empty lines.

    const data = {};
    const values = processBytestrLine(line);
    for (let j = 0; j < headers.length; j++) {
      data[headers[j]] = values[j];
    }
    const d = data as Shape;

    if (currShapeId === null) {
      currShapeId = d.shape_id;
    }

    const directedRoute = shapeToRouteDict.get(currShapeId);
    if (!directedRoute || seenDirectedRouteIds.has(`${directedRoute.routeId}${directedRoute.directionId}`)) {
      continue;
    }

    if (currShapeId !== d.shape_id) {
      const newFeat = generateLineFeature(currCoords, currShapeId, directedRoute.routeId, directedRoute.directionId);
      fileStream.write(JSON.stringify(newFeat) + ',\n');

      seenDirectedRouteIds.add(`${directedRoute.routeId}${directedRoute.directionId}`);
      currShapeId = d.shape_id;
      currCoords = [];
    }

    currCoords.push([parseFloat(d.shape_pt_lon), parseFloat(d.shape_pt_lat)]);
  }

  // Clean up: roll up the last set of coords
  if (currShapeId) {
    const directedRoute = shapeToRouteDict.get(currShapeId);
    const newFeat = generateLineFeature(currCoords, currShapeId, directedRoute.routeId, directedRoute.directionId);
    fileStream.write(JSON.stringify(newFeat) + '\n'); // No comma on the last feature
  }

  fileStream.write(']}');
  fileStream.end();

  console.log(`GeoJSON written to ${outputFilePath}`);
}

const [n, p, ...args] = process.argv;
const [zipPath, geojsonPath] = args;

if (!existsSync(zipPath)) {
  console.error(`GTFS zip path incorrect: ${zipPath}`);
  process.exit(1);
}

processGTFS(zipPath, geojsonPath).catch(console.error);