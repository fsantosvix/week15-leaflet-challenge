// Store our API endpoint as queryUrl.
// Dataset used: Past 30 days - M4.5+ Earthquakes
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Get data from the URL using D3
d3.json(queryUrl).then(function (data) {
    // Console log the response for consultation
    console.log(data);
    // Call the createFeatures function using the data retrieved
    createFeatures(data.features);
});

// Declare variables for the getColors function and the legend
let limits = ['<10', '10-30', '30-50', '50-70', '70-90', '>90'];
let colors = ['#FEDFD4', '#F29479', '#F26A4F', '#EF3C2D', '#CB1B16', '#65010C']

// Function to determine marker color by depth
function getColor(depth) {
    if (depth < 10) return colors[0];
    else if (depth < 30) return colors[1];
    else if (depth < 50) return colors[2];
    else if (depth < 70) return colors[3];
    else if (depth < 90) return colors[4];
    else return colors[5];
};


function createFeatures(earthquakeData) {

    // Create a function to run for each feature of the array within the data retrieved
    function onEachFeature(feature, layer) {
        // Create a popup to each feature
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr>
                        <p><strong>When:</strong> ${new Date(feature.properties.time)}</p>
                        <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
                        <p><strong>Depth:</strong> ${feature.geometry.coordinates[2]}</p>`);
    }

    // Create the GeoJSON layer 
    let earthquakes = L.geoJSON(earthquakeData, {
        // Connect the results from the onEachFeature function to each data point
        onEachFeature: onEachFeature,

        // Create and customise the circle markers
        pointToLayer: function (feature, latlng) {
            let depth = feature.geometry.coordinates[2]

            return L.circle(latlng, {
                fillColor: getColor(depth),
                fillOpacity: 0.8,
                color: "black",
                weight: 0.3,
                // Use the magnitude to define the radius of each circle
                radius: feature.properties.mag * 35000
            })

        }
    });

    // Create map using the createMap function
    createMap(earthquakes);
};


// Create a function to create the map
function createMap(earthquakes) {

    // Create tile layer
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create baseMaps object.
    let baseMaps = {
        "Street": street
    };

    // Create overlay object
    let overlayMaps = {
        "Earthquakes": earthquakes,

    };

    // Create map
    let myMap = L.map("map", {
        center: [0, 0],
        zoom: 2,
        layers: [street, earthquakes]
    });


    // Add legend
    // Create a legend control
    let legend = L.control({ position: "bottomright" });

    // Define the onAdd method for the legend control
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");

        // Add legend title
        div.innerHTML = "<h3>Depth</h3>";

        // Add color scale legend with limits and colors using list items without bullet points
        div.innerHTML += "<ul style='list-style-type: none; margin: 10px;'>";
        for (let i = 0; i < limits.length; i++) {
            div.innerHTML += "<li style='list-style-type: none;'><span style='background-color: " + colors[i] + ";'>&nbsp;&nbsp;&nbsp;</span> " + limits[i] + "</li>";
        }
        div.innerHTML += "</ul>";

        return div;
    };


    // Add the legend control to the map
    legend.addTo(myMap);


    // Create a layer control pass the baseMaps and overlayMaps.
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
};