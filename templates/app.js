// Define Graph Class for network
class Graph {
  constructor() {
    this.nodes = new Map();
  }

  addNode(node) {
    const key = JSON.stringify(node);
    if (!this.nodes.has(key)) {
      this.nodes.set(key, new Map());
    }
  }

  addEdge(start, end, weight) {
    const startKey = JSON.stringify(start);
    const endKey = JSON.stringify(end);
    this.addNode(start);
    this.addNode(end);
    this.nodes.get(startKey).set(endKey, weight);
  }

  getNeighbors(node) {
    const key = JSON.stringify(node);
    return this.nodes.get(key) || new Map();
  }

  getDistance(start, end) {
    const startKey = JSON.stringify(start);
    const endKey = JSON.stringify(end);
    return this.nodes.get(startKey).get(endKey);
  }
}





// Define Priority Queue
class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(element, priority) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.elements.shift().element;
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  contains(element) {
    return this.elements.some(e => e.element === element);
  }
}




// The backbone, Open Street Map
var osm = new ol.layer.Tile({
    title: "Watercolor",
    baseLayer: true,
    source: new ol.source.OSM(),
    opacity:0.75,
    attribution: '© OpenStreetMap contributors',
  });



// The map
var map = new ol.Map ({
  target: 'map',
  view: new ol.View ({
    zoom: 16,
    center: [-10616314.971583098, 3472448.7167625874]    
  }),
  layers: [osm]
});

markerRedStyle = new ol.style.Style({
    image: new ol.style.Icon({
      opacity: 1,
      src: './images/marker.svg',
      scale: 2
    })
  });



markerGreenStyle = new ol.style.Style({
image: new ol.style.Icon({
    opacity: 1,
    src: './images/markergreen.svg',
    scale: 2
})
});

markerBrownStyle = new ol.style.Style({
    image: new ol.style.Icon({
      opacity: 1,
      src: './images/markerbrown.svg',
      scale: 2
    })
  });


BuildingsStyle = new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'blue',
    }),
    stroke: new ol.style.Stroke({
      color: '#ffcc33',
      width: 4
    })
  });

  TunnelLineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#e87f0e',
      width: 5
    })
  })

  const PointStyle11 = new ol.style.Style({
    image: new ol.style.Circle({
      radius: 4,
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 255, 0.5)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 255, 0.8)',
        width: 1
      })
    })
  });
  
  const PointStyle11Inner = new ol.style.Style({
    image: new ol.style.Circle({
      radius: 2,
      fill: new ol.style.Fill({
        color: 'rgba(255, 0, 0, 0.5)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(255, 0, 0, 0.8)',
        width: 1
      })
    })
  });
  


  const markerBlueStyle = [PointStyle11, PointStyle11Inner]


  const radar = new ol.layer.Tile({
    source: new ol.source.TileWMS({
                url: 'https://opengeo.ncep.noaa.gov/geoserver/',
                params: {'LAYERS': 'conus_bref_qcd',
                         'TILED' : true,
                         'SRS': 'EPSG:3857'},
                allowTemporalUpdates:true,
                projection:'EPSG:3857',
                serverType: 'geoserver',                
     }),
    
    
}); 






map.addLayer(radar)

  var tunnel =  new ol.layer.Vector({
    source: new ol.source.Vector({
               format: new ol.format.GeoJSON(),
               url: 'https://raw.githubusercontent.com/jorgegarcia1396/houston-tunnel-mapping/main/tunnels.geojson',
     
                }),
     style:TunnelLineStyle,
     title:'Tunnel'
 });

 var accessPoints =  new ol.layer.Vector({
    source: new ol.source.Vector({
               format: new ol.format.GeoJSON(),
               url: 'https://raw.githubusercontent.com/jorgegarcia1396/houston-tunnel-mapping/main/access-points.geojson',
     
                }),
     style:markerBlueStyle,
     title:'Tunnel Access Point'
 });
  
 map.addLayer(tunnel);  
 map.addLayer(accessPoints);

// Add a tooltip
var tooltipContainer = document.getElementById('tooltip');
var tooltipContent = document.getElementById('tooltip-content');

var tooltip = new ol.Overlay({
    element: tooltipContainer,
    offset: [10, 0],
    positioning: 'bottom-center'
});
map.addOverlay(tooltip);

// map.on('pointermove', function(evt) {
//     var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
//         return { feature: feature, layer: layer };
//     });

//     if (feature) {
//         var coordinates = evt.coordinate;
//         var name = feature.feature.get('name');
//         var layerTitle = feature.layer.get('title');
//         var tooltipText = name ? name : layerTitle; // Use 'name' if available, otherwise use layer's title
//         tooltipContent.innerHTML = tooltipText;
//         tooltip.setPosition(coordinates);
//         tooltipContainer.style.display = 'block';
//     } else {
//         tooltip.setPosition(undefined);
//         tooltipContainer.style.display = 'none';
//     }
// });

// Draw Marker
const PointStyleText = new ol.style.Style({
  image: new ol.style.Icon({
    scale:0.02,
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'images/map-marker.svg',
  }),
});



const source = new ol.source.Vector({wrapX: false});

const vector = new ol.layer.Vector({
  source: source,
  style: PointStyleText
});

const type = "Point"

let draw;
function addInteraction() {   
    draw = new ol.interaction.Draw({
      source: source,
      type: type,
    });
    map.addInteraction(draw);
 
}


// Function to find the closest point on the tunnel
function findClosestPoint(tunnel, targetPoint) {
  let closestPoint = null;
  let minDistance = Infinity;

  console.log('Target Point:', targetPoint); // Debugging log

  if (!Array.isArray(targetPoint) || targetPoint.length !== 2 || !targetPoint.every(coord => typeof coord === 'number')) {
    console.error('Target point is not a valid Point or coordinates are not numbers');
    return null;
  }

  tunnel.getSource().getFeatures().forEach(function(tunnelFeature) {
    let lineCoordinates = tunnelFeature.getGeometry().getCoordinates();

    // Ensure each coordinate pair is an array of numbers
    let validLineCoordinates = lineCoordinates.filter(coord => Array.isArray(coord) && coord.length === 2 && coord.every(c => typeof c === 'number'));

    let lineString = {
      type: 'LineString',
      coordinates: validLineCoordinates
    };

    if (lineString.type === 'LineString') {
      let vectorGeoJSON = {
        type: 'Point',
        coordinates: targetPoint
      };

      if (vectorGeoJSON.type === 'Point' && Array.isArray(vectorGeoJSON.coordinates) && vectorGeoJSON.coordinates.every(coord => typeof coord === 'number')) {
        try {
          let snapped = turf.nearestPointOnLine(lineString, vectorGeoJSON); // Use nearestPointOnLine to get exact closest point
          let distance = turf.distance(vectorGeoJSON, snapped);

          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = snapped.geometry.coordinates;
          }
        } catch (error) {
          console.error('Error with Turf.js:', error);
        }
      } else {
        console.error('Vector is not a valid Point or coordinates are not numbers');
      }
    } else {
      console.error('Geometry is not a LineString');
    }
  });

  console.log('Closest Point:', closestPoint); // Debugging log
  return closestPoint;
}



function interpolatePoints(start, end, tunnel) {
  let lineString = {
    type: 'LineString',
    coordinates: tunnel.getSource().getFeatures().flatMap(feature => {
      let lineCoordinates = feature.getGeometry().getCoordinates();
      return lineCoordinates.flatMap(coord => {
        if (Array.isArray(coord) && coord.length === 2 && coord.every(c => typeof c === 'number')) {
          return [coord];
        } else if (Array.isArray(coord) && coord.every(c => Array.isArray(c) && c.length === 2 && c.every(n => typeof n === 'number'))) {
          return coord;
        } else {
          return [];
        }
      });
    })
  };

  console.log('LineString:', lineString); // Debugging log

  let startPoint = turf.point(start);
  let endPoint = turf.point(end);

  let snappedStart = turf.nearestPointOnLine(lineString, startPoint);
  let snappedEnd = turf.nearestPointOnLine(lineString, endPoint);

  console.log('Snapped Start:', snappedStart); // Debugging log
  console.log('Snapped End:', snappedEnd); // Debugging log

  if (!snappedStart || !snappedEnd) {
    console.error('Snapped points are invalid');
    return [];
  }

  let line = turf.lineSlice(snappedStart, snappedEnd, lineString);
  console.log('Interpolated Line:', line); // Debugging log

  return line.geometry.coordinates;
}









const highlightsource = new ol.source.Vector({wrapX: false});

const highlightLayer = new ol.layer.Vector({
  source: highlightsource
  
});
map.addLayer(highlightLayer);


// Function to highlight the shortest path
function highlightShortestPath(path) {
  console.log('Path:', path);

  if (Array.isArray(path) && path.every(coord => Array.isArray(coord) && coord.length === 2 && coord.every(c => typeof c === 'number'))) {
    let pathFeature = new ol.Feature({
      geometry: new ol.geom.LineString(path),
    });

    pathFeature.setStyle(new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'cyan',
        width: 5,
      }),
    }));

    highlightLayer.getSource().clear(); // Clear previous highlights
    highlightLayer.getSource().addFeature(pathFeature);
  } else {
    console.error('Invalid path format:', path);
  }
}















// Function to convert tunnel network to graph
function flattenCoordinates(coordinates) {
  return coordinates.reduce((acc, val) => Array.isArray(val[0]) ? acc.concat(flattenCoordinates(val)) : acc.concat([val]), []);
}


function convertTunnelsToGraph(tunnel) {
  let graph = new Graph();

  tunnel.getSource().getFeatures().forEach(function(tunnelFeature) {
    let coordinates = tunnelFeature.getGeometry().getCoordinates();
    let flattenedCoordinates = flattenCoordinates(coordinates);

    for (let i = 0; i < flattenedCoordinates.length - 1; i++) {
      let start = flattenedCoordinates[i];
      let end = flattenedCoordinates[i + 1];

      if (Array.isArray(start) && start.length === 2 && start.every(c => typeof c === 'number') &&
          Array.isArray(end) && end.length === 2 && end.every(c => typeof c === 'number')) {
        let distance = turf.distance(turf.point(start), turf.point(end));

        graph.addEdge(start, end, distance);
        graph.addEdge(end, start, distance); // Assuming bidirectional tunnel
      } else {
        console.error('Invalid coordinates:', start, end);
      }
    }
  });

  console.log('Graph nodes:', graph.nodes);
  return graph;
}



function customPathfinding(graph, start, end) {
  let openSet = new PriorityQueue();
  openSet.enqueue(start, 0);

  let cameFrom = new Map();
  let gScore = new Map();
  gScore.set(JSON.stringify(start), 0);

  let fScore = new Map();
  fScore.set(JSON.stringify(start), turf.distance(turf.point(start), turf.point(end)));

  while (!openSet.isEmpty()) {
    let current = openSet.dequeue();

    if (JSON.stringify(current) === JSON.stringify(end)) {
      return reconstructPath(cameFrom, current);
    }

    let neighbors = graph.getNeighbors(current);
    neighbors.forEach(function(weight, neighbor) {
      let neighborCoords = JSON.parse(neighbor);
      let tentativeGScore = gScore.get(JSON.stringify(current)) + weight;

      if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, tentativeGScore + turf.distance(turf.point(neighborCoords), turf.point(end)));

        if (!openSet.contains(neighborCoords)) {
          openSet.enqueue(neighborCoords, fScore.get(neighbor));
        }
      }
    });
  }

  return null; // No path found
}







// Function to reconstruct path
function reconstructPath(cameFrom, current) {
  let totalPath = [current];
  let visited = new Set();
  let iteration = 0;

  while (cameFrom.has(JSON.stringify(current))) {
    if (visited.has(JSON.stringify(current))) {
      console.error('Cycle detected in path reconstruction. Breaking the loop.');
      break;
    }

    visited.add(JSON.stringify(current));
    current = cameFrom.get(JSON.stringify(current));
    totalPath.unshift(current);

    iteration++;
    if (iteration > 1000) {
      console.error('Path reconstruction is taking too long, possible infinite loop.');
      break;
    }
  }

  return totalPath;
}






// Function to calculate the shortest path
function calculateShortestPath(start, end, tunnel) {
  console.log('Converting tunnels to graph...');
  let graph = convertTunnelsToGraph(tunnel);
  console.log('Graph conversion complete. Starting custom pathfinding...');
  let shortestPath = customPathfinding(graph, start, end);
  console.log('Shortest Path:', shortestPath);
  return shortestPath;
}





document.getElementById('addBtn').addEventListener('click', function () {
  addInteraction()  
  map.addLayer(vector)
  map.removeInteraction(selecti)

});

document.getElementById('clearBtn').addEventListener('click', function () {
  map.removeInteraction(draw)
  map.removeLayer(vector)
  highlightLayer.getSource().clear(); 
  vector.getSource().clear();   
  map.addInteraction(selecti)
});

document.getElementById('routeBtn').addEventListener('click', function () {
  map.removeInteraction(draw);
  let points = vector.getSource().getFeatures();

  if (points.length < 2) {
    console.error('Please select both start and end points.');
    return;
  }

  let start = points[0].getGeometry().getCoordinates();
  let end = points[1].getGeometry().getCoordinates();

  console.log('Start Point:', start);
  console.log('End Point:', end);

  let closestStart = findClosestPoint(tunnel, start);
  let closestEnd = findClosestPoint(tunnel, end);

  console.log('Closest Start:', closestStart);
  console.log('Closest End:', closestEnd);

  if (closestStart && closestEnd) {
    let interpolatedPath = interpolatePoints(closestStart, closestEnd, tunnel);
    console.log('Interpolated Path:', interpolatedPath);

    highlightShortestPath(interpolatedPath);
  } else {
    console.error('Could not find closest points on the tunnel.');
  }
});


















// Select  interaction
var selecti = new ol.interaction.Select({
    hitTolerance: 5,
    condition: ol.events.condition.singleClick
  });
  map.addInteraction(selecti);
  
  // Select feature when click on the reference index
  selecti.on('select', function(e) {
    var f = e.selected[0];
    if (f) {      
      listCtrl.select(f)
    }
  });

  // Select control
  var listCtrl = new ol.control.FeatureList({
    title: 'Tunnels',   
    collapsed: false,
    features: tunnel.getSource(),    
  });

  listCtrl.enableSort('nom', 'region', 'mag')
  map.addControl (listCtrl);
  listCtrl.on('select', function(e) {
    selecti.getFeatures().clear();
    selecti.getFeatures().push(e.feature);    
  });

  listCtrl.on('dblclick', function(e) {
    map.getView().fit(e.feature.getGeometry().getExtent())
    map.getView().setZoom(map.getView().getZoom() - 1)
  })

  listCtrl.on(['resize', 'collapse', 'sort'], function(e) {
    console.log(e)
  })



