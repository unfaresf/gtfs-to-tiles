# README

## Getting Started
Convert gtfs into geojson by running.

Warning [convert-gtfs-to-geojson.ts](convert-gtfs-to-geojson.ts) is buggy and doesnt work. it still is probably the right long term plan but too slow to iterating/experiment. [v2-convert.js](v2-convert.js) uses the node-gtfs lib. its works very well but doesnt format the geojson in the ideal way for our use case.

### GTFS setup

This is the GTFS for the San Francisco Bay area from [API 511](https://511.org/open-data/transit). Replace `API_KEY` in the below cURL with your own API key from [here](https://511.org/open-data/token). If you aren't in the bay area use any other GTFS zip. just be sure to put the zip file at `./gtfs/gtfs.zip`.

```bash
curl -o data/gtfs.zip "http://api.511.org/transit/datafeeds?operator_id=RG&api_key=API_KEY"
```

```
npm run convert path/to/gtfs.zip path/to/output/location.geojson

// e.g.
npm run convert -- trips -p ./data/gtfs.zip -o geojson/trips.geojson
npm run convert -- stops -p ./data/gtfs.zip -o geojson/stops.geojson
```

Convert geojson to mbtiles with [tippecanoe](https://github.com/felt/tippecanoe) using the following command.

```
tippecanoe --force -zg -o tiles/stops.mbtiles --drop-densest-as-needed --extend-zooms-if-still-dropping geojson/stops.geojson
tippecanoe --force -zg -o tiles/trips.mbtiles --drop-densest-as-needed --extend-zooms-if-still-dropping geojson/trips.geojson
```

View the output file with
```
docker run --rm -it -v ./tiles:/data -p 8080:8080 maptiler/tileserver-gl
```

To upload new tiles to unfaresf server use the follow command
```
rsync -azP *.mbtiles machine@spring-lake:/home/machine/tileserver-gl/staging/
rsync -azP *.mbtiles machine@spring-lake:/home/machine/tileserver-gl/production/
```