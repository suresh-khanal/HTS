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

markerBlueStyle = new ol.style.Style({
    image: new ol.style.Icon({
      opacity: 1,
      src: './images/markerblue.svg',
      scale: 1
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

TunnelLineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#e87f0e',
      width: 5
    })
  })

BuildingsStyle = new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'blue',
    }),
    stroke: new ol.style.Stroke({
      color: '#ffcc33',
      width: 4
    })
  });

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

map.on('pointermove', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        return { feature: feature, layer: layer };
    });

    if (feature) {
        var coordinates = evt.coordinate;
        var name = feature.feature.get('name');
        var layerTitle = feature.layer.get('title');
        var tooltipText = name ? name : layerTitle; // Use 'name' if available, otherwise use layer's title
        tooltipContent.innerHTML = tooltipText;
        tooltip.setPosition(coordinates);
        tooltipContainer.style.display = 'block';
    } else {
        tooltip.setPosition(undefined);
        tooltipContainer.style.display = 'none';
    }
});

