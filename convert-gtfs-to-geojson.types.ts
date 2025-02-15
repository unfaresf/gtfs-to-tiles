import type AdmZip from 'adm-zip';

export type Entries = {
  shapes?: AdmZip.IZipEntry;
  stops?: AdmZip.IZipEntry;
  trips?: AdmZip.IZipEntry;
}
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