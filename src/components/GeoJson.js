/*
 * Based on the Geojson.js of the react-native-maps package
 */
import polylabel from 'polylabel';
import React from 'react';
import { View } from 'react-native';
import { Marker, Polygon, Polyline } from 'react-native-maps';
import uuid from 'uuid';

export const makeOverlays = (features) => {
  const points = features
    .filter((f) => f.geometry && (f.geometry.type === 'Point' || f.geometry.type === 'MultiPoint'))
    .map((feature) => makeCoordinates(feature).map((coordinates) => makeOverlay(coordinates, feature)))
    .reduce(flatten, [])
    .map((overlay) => ({ ...overlay, type: 'point' }));

  const lines = features
    .filter((f) => f.geometry && (f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'))
    .map((feature) => makeCoordinates(feature).map((coordinates) => makeOverlay(coordinates, feature)))
    .reduce(flatten, [])
    .map((overlay) => ({ ...overlay, type: 'polyline' }));

  const multipolygons = features
    .filter((f) => f.geometry && f.geometry.type === 'MultiPolygon')
    .map((feature) => makeCoordinates(feature).map((coordinates) => makeOverlay(coordinates, feature)))
    .reduce(flatten, []);

  const polygons = features
    .filter((f) => f.geometry && f.geometry.type === 'Polygon')
    .map((feature) => makeOverlay(makeCoordinates(feature), feature))
    .reduce(flatten, [])
    .concat(multipolygons)
    .map((overlay) => ({ ...overlay, type: 'polygon' }));

  return points.concat(lines).concat(polygons);
};

const flatten = (prev, curr) => prev.concat(curr);

const makeOverlay = (coordinates, feature) => {
  const overlay = {
    feature,
    id: feature.properties
      ? feature.properties.id || feature.properties.imo || feature.properties.mmsi
      : feature.id
      ? feature.id
      : uuid(),
  };
  if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
    overlay.coordinates = coordinates[0];
    if (coordinates.length > 1) {
      overlay.holes = coordinates.slice(1);
    }
  } else {
    overlay.coordinates = coordinates;
  }
  return overlay;
};

const makePoint = (c) => ({
  latitude: typeof c[1] == 'string' ? parseFloat(c[1]) : c[1],
  longitude: typeof c[0] == 'string' ? parseFloat(c[0]) : c[0],
});

const makeLine = (l) => l.map(makePoint);

const makeCoordinates = (feature) => {
  const g = feature.geometry;
  if (g.type === 'Point') {
    return [makePoint(g.coordinates)];
  } else if (g.type === 'MultiPoint') {
    return g.coordinates.map(makePoint);
  } else if (g.type === 'LineString') {
    return [makeLine(g.coordinates)];
  } else if (g.type === 'MultiLineString') {
    return g.coordinates.map(makeLine);
  } else if (g.type === 'Polygon') {
    return g.coordinates.map(makeLine);
  } else if (g.type === 'MultiPolygon') {
    return g.coordinates.map((p) => p.map(makeLine));
  } else {
    return [];
  }
};

const createChildren = (children, params) => {
  if (typeof children === 'function') {
    return children(params);
  }

  return children;
};

const opacityToHex = (opacity) => {
  // opacity 0 - 1.0
  return (opacity * 255).toString(16);
};

const getPolygonCenter = (overlay) => {
  if (overlay && overlay.feature && overlay.feature.geometry && overlay.feature.geometry.coordinates) {
    center = polylabel(overlay.feature.geometry.coordinates, 1.0);
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      return {
        latitude: center[1],
        longitude: center[0],
      };
    }
  }
  return null;
};

const getPolyLineCenter = (overlay) => {
  if (overlay && overlay.coordinates && overlay.coordinates.length) {
    const x = overlay.coordinates.map((c) => c.latitude);
    const y = overlay.coordinates.map((c) => c.longitude);

    const minX = Math.min.apply(null, x);
    const maxX = Math.max.apply(null, x);

    const minY = Math.min.apply(null, y);
    const maxY = Math.max.apply(null, y);

    if (!isNaN(minX) && !isNaN(maxX) && !isNaN(minY) && !isNaN(maxY)) {
      return {
        latitude: (minX + maxX) / 2,
        longitude: (minY + maxY) / 2,
      };
    }
  }
  return null;
};

const Geojson = (props) => {
  const overlays = makeOverlays(props.geojson.features);

  return (
    <React.Fragment key={props.geojson.id || uuid()}>
      {overlays.map((overlay, index) => {
        let strokeColor = props.strokeColor;
        let fillColor = props.fillColor;
        let strokeWidth = props.strokeWidth;
        if (overlay.feature.style) {
          if (overlay.feature.style.color) {
            strokeColor = overlay.feature.style.opacity
              ? `${overlay.feature.style.color}${opacityToHex(overlay.feature.style.opacity)}`
              : overlay.feature.style.color;
          }
          if (overlay.feature.style.fill) {
            fillColor = overlay.feature.style.fillOpacity
              ? `${overlay.feature.style.fill}${opacityToHex(overlay.feature.style.fillOpacity)}`
              : overlay.feature.style.fill;
          }
          if (overlay.feature.style.weight) {
            strokeWidth = overlay.feature.style.weight;
          }
        }
        if (overlay.type === 'point') {
          return (
            <Marker
              title={overlay.feature.properties.name}
              description={overlay.feature.properties.description}
              key={overlay.id}
              coordinate={overlay.coordinates}
              image={props.image}
              pinColor={props.color}
              onCalloutPress={(event) => {
                if (props.onCalloutPress !== undefined) {
                  props.onCalloutPress(event, overlay.feature);
                }
              }}
              onPress={(event) => {
                if (props.onPress !== undefined) {
                  props.onPress(event, overlay.feature);
                }
              }}
              onSelect={(event) => {
                if (props.onSelect !== undefined) {
                  props.onSelect(event, overlay.feature);
                }
              }}
              onDeselect={(event) => {
                if (props.onDeselect !== undefined) {
                  props.onDeselect(event, overlay.feature);
                }
              }}
              // Enabling this fixes callout opening twice quickly,  but introduces
              // another bug where sometimes the callout only flashes without staying open
              //pointerEvents="auto"
              stopPropagation
              ref={(ref) => {
                // Modifies original list, check that item still exists
                if (overlay && overlay.feature) {
                  overlay.feature.ref = ref;
                }
              }}
              tracksViewChanges={props.tracksViewChanges}
              zIndex={props.zIndex}>
              {createChildren(props.children, overlay)}
            </Marker>
          );
        }
        if (overlay.type === 'polygon') {
          const center = props.children ? getPolygonCenter(overlay) : null;
          return (
            <View key={`polygon-${overlay.id}-view`}>
              <Polygon
                key={overlay.id}
                coordinates={overlay.coordinates}
                holes={overlay.holes}
                strokeColor={strokeColor}
                fillColor={fillColor}
                strokeWidth={strokeWidth}
                onPress={(event) => {
                  if (props.onPolygonPolylinePress !== undefined) {
                    props.onPolygonPolylinePress(event, overlay.feature);
                  }
                }}
                tappable={props.onPolygonPolylinePress !== undefined}
                ref={
                  props.children
                    ? undefined
                    : (ref) => {
                        if (overlay && overlay.feature) {
                          // Modifies original list, check that item still exists
                          overlay.feature.ref = ref;
                        }
                      }
                }
                zIndex={props.zIndex}
              />
              {props.children ? (
                <Marker
                  key={`polygon-${overlay.id}-marker`}
                  ref={(ref) => {
                    if (overlay && overlay.feature) {
                      // Modifies original list, check that item still exists
                      overlay.feature.ref = ref;
                    }
                  }}
                  zIndex={props.zIndex}
                  //pointerEvents="auto"
                  stopPropagation
                  coordinate={center ? center : overlay.coordinates[0]}>
                  {createChildren(props.children, overlay)}
                </Marker>
              ) : null}
            </View>
          );
        }
        if (overlay.type === 'polyline') {
          const center = props.children ? getPolyLineCenter(overlay) : null;
          return (
            <View key={`polyline-${overlay.id}-view`}>
              <Polyline
                key={overlay.id}
                coordinates={overlay.coordinates}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
                lineDashPhase={props.lineDashPhase}
                lineDashPattern={props.lineDashPattern}
                lineCap={props.lineCap}
                lineJoin={props.lineJoin}
                miterLimit={props.miterLimit}
                onPress={(event) => {
                  if (props.onPolygonPolylinePress !== undefined) {
                    props.onPolygonPolylinePress(event, overlay.feature);
                  }
                }}
                tappable={props.onPolygonPolylinePress !== undefined}
                ref={
                  props.children
                    ? undefined
                    : (ref) => {
                        if (overlay && overlay.feature) {
                          // Modifies original list, check that item still exists
                          overlay.feature.ref = ref;
                        }
                      }
                }
                zIndex={props.zIndex}
              />
              {props.children ? (
                <Marker
                  key={`polyline-${overlay.id}-marker`}
                  ref={(ref) => {
                    if (overlay && overlay.feature) {
                      // Modifies original list, check that item still exists
                      overlay.feature.ref = ref;
                    }
                  }}
                  zIndex={props.zIndex}
                  //pointerEvents="auto"
                  stopPropagation
                  coordinate={center ? center : overlay.coordinates[0]}>
                  {createChildren(props.children, overlay)}
                </Marker>
              ) : null}
            </View>
          );
        }
      })}
    </React.Fragment>
  );
};

export const makeMarkersFromGeojson = (props) => {
  const overlays = makeOverlays(props.geojson.features);

  return overlays.map((overlay, index) => {
    let strokeColor = props.strokeColor;
    let fillColor = props.fillColor;
    let strokeWidth = props.strokeWidth;
    if (overlay.feature.style) {
      if (overlay.feature.style.color) {
        strokeColor = overlay.feature.style.opacity
          ? `${overlay.feature.style.color}${opacityToHex(overlay.feature.style.opacity)}`
          : overlay.feature.style.color;
      }
      if (overlay.feature.style.fill) {
        fillColor = overlay.feature.style.fillOpacity
          ? `${overlay.feature.style.fill}${opacityToHex(overlay.feature.style.fillOpacity)}`
          : overlay.feature.style.fill;
      }
      if (overlay.feature.style.weight) {
        strokeWidth = overlay.feature.style.weight;
      }
    }
    if (overlay.type === 'point') {
      return (
        <Marker
          title={overlay.feature.properties.name}
          description={overlay.feature.properties.description}
          key={overlay.id}
          coordinate={overlay.coordinates}
          image={props.image}
          pinColor={props.color}
          onCalloutPress={(event) => {
            if (props.onCalloutPress !== undefined) {
              props.onCalloutPress(event, overlay.feature);
            }
          }}
          onPress={(event) => {
            if (props.onPress !== undefined) {
              props.onPress(event, overlay.feature);
            }
          }}
          onSelect={(event) => {
            if (props.onSelect !== undefined) {
              props.onSelect(event, overlay.feature);
            }
          }}
          onDeselect={(event) => {
            if (props.onDeselect !== undefined) {
              props.onDeselect(event, overlay.feature);
            }
          }}
          // Enabling this fixes callout opening twice quickly,  but introduces
          // another bug where sometimes the callout only flashes without staying open
          //pointerEvents="auto"
          stopPropagation
          ref={(ref) => {
            // Modifies original list, check that item still exists
            if (overlay && overlay.feature) {
              overlay.feature.ref = ref;
            }
          }}
          tracksViewChanges={props.tracksViewChanges}
          zIndex={props.zIndex}>
          {createChildren(props.children, overlay)}
        </Marker>
      );
    }
    if (overlay.type === 'polygon') {
      const center = props.children ? getPolygonCenter(overlay) : null;
      return (
        <View key={`polygon-${overlay.id}-view`}>
          <Polygon
            key={overlay.id}
            coordinates={overlay.coordinates}
            holes={overlay.holes}
            strokeColor={strokeColor}
            fillColor={fillColor}
            strokeWidth={strokeWidth}
            onPress={(event) => {
              if (props.onPolygonPolylinePress !== undefined) {
                props.onPolygonPolylinePress(event, overlay.feature);
              }
            }}
            tappable={props.onPolygonPolylinePress !== undefined}
            ref={
              props.children
                ? undefined
                : (ref) => {
                    if (overlay && overlay.feature) {
                      // Modifies original list, check that item still exists
                      overlay.feature.ref = ref;
                    }
                  }
            }
            zIndex={props.zIndex}
          />
          {props.children ? (
            <Marker
              key={`polygon-${overlay.id}-marker`}
              ref={(ref) => {
                if (overlay && overlay.feature) {
                  // Modifies original list, check that item still exists
                  overlay.feature.ref = ref;
                }
              }}
              zIndex={props.zIndex}
              //pointerEvents="auto"
              stopPropagation
              coordinate={center ? center : overlay.coordinates[0]}>
              {createChildren(props.children, overlay)}
            </Marker>
          ) : null}
        </View>
      );
    }
    if (overlay.type === 'polyline') {
      const center = props.children ? getPolyLineCenter(overlay) : null;
      return (
        <View key={`polyline-${overlay.id}-view`}>
          <Polyline
            key={overlay.id}
            coordinates={overlay.coordinates}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            lineDashPhase={props.lineDashPhase}
            lineDashPattern={props.lineDashPattern}
            lineCap={props.lineCap}
            lineJoin={props.lineJoin}
            miterLimit={props.miterLimit}
            onPress={(event) => {
              if (props.onPolygonPolylinePress !== undefined) {
                props.onPolygonPolylinePress(event, overlay.feature);
              }
            }}
            tappable={props.onPolygonPolylinePress !== undefined}
            ref={
              props.children
                ? undefined
                : (ref) => {
                    if (overlay && overlay.feature) {
                      // Modifies original list, check that item still exists
                      overlay.feature.ref = ref;
                    }
                  }
            }
            zIndex={props.zIndex}
          />
          {props.children ? (
            <Marker
              key={`polyline-${overlay.id}-marker`}
              ref={(ref) => {
                if (overlay && overlay.feature) {
                  // Modifies original list, check that item still exists
                  overlay.feature.ref = ref;
                }
              }}
              zIndex={props.zIndex}
              //pointerEvents="auto"
              stopPropagation
              coordinate={center ? center : overlay.coordinates[0]}>
              {createChildren(props.children, overlay)}
            </Marker>
          ) : null}
        </View>
      );
    }
  });
};

export default Geojson;
