# README

## Getting Started
Convert gtfs into geojson by running.

Warning [convert-gtfs-to-geojson.ts](convert-gtfs-to-geojson.ts) is buggy and doesnt work. it still is probably the right long term plan but too slow to iterating/experiment. [v2-convert.js](v2-convert.js) uses the node-gtfs lib. its works very well but doesnt format the geojson in the ideal way for our use case.

```
npm run convert path/to/gtfs.zip path/to/output/location.geojson

// e.g.
npm run convert data/sf-gtfs.zip geojson/sf-transit.geojson
```

Convert geojson to mbtiles with [tippecanoe](https://github.com/felt/tippecanoe) using the following command.

```
tippecanoe --force -zg -o tiles/transit_lines.mbtiles --drop-densest-as-needed --extend-zooms-if-still-dropping geojson/sf-transit.geojson
```

View the output file with
```
docker run --rm -it -v ./tiles:/data -p 8080:8080 maptiler/tileserver-gl
```