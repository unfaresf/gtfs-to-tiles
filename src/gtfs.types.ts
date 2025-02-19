import type { Position } from 'geojson'

// gtfs types
export type Route = {
  route_id:string;
  agency_id:string;
  route_short_name:string;
  route_long_name:string;
  route_desc:string;
  route_type:string;
  route_url:string;
  route_color:string;
  route_text_color:string;
  route_sort_order:string;
  continuous_pickup:string;
  continuous_drop_off:string;
  network_id:string;
  as_route:string;
};

export type Shape = {
  shape_id:string;
  shape_pt_lat:string;
  shape_pt_lon:string;
  shape_pt_sequence:string;
  shape_dist_traveled:string;
};

export type Trip = {
  route_id:string;
  service_id:string;
  trip_id:string;
  trip_headsign:string;
  trip_short_name:string;
  direction_id:string;
  block_id:string;
  shape_id:string;
  wheelchair_accessible:string;
  bikes_allowed:string
}

export type CustomStop = {
  route_id: string;
  direction_id:number;
  stop_id: string;
  stop_sequence: number;
  stop_name: string;
  stop_lat:number;
  stop_lon:number;
};

export type StopFeature = {
  type: string,
  properties: {
    direction_id: CustomStop['direction_id'],
    route_id: CustomStop['route_id'],
    stop_id: CustomStop['stop_id'],
    stop_name: CustomStop['stop_name'],
    stop_sequence: CustomStop['stop_sequence'],
  },
  geometry: {
    type: string,
    coordinates: [CustomStop['stop_lon'], CustomStop['stop_lat']],
  }
}

export type CustomTrip = {
  route_id: string;
	agency_id: string;
	route_short_name: string;
	route_long_name: string;
	route_color: string;
	route_text_color: string;
	direction_id: number;
	shape_id: string;
	line: Position[];
  trip_id: string;
}