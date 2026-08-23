const mapToken = window.MAP_TOKEN;

console.log("TOKEN:", mapToken);
console.log("TOKEN LENGTH:", mapToken.length);

console.log("COORDINATES:", listing.geometry.coordinates);
console.log("LOCATION:", listing.location);

const map = new maplibregl.Map({
    container: "map",
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapToken}`,
    center: listing.geometry.coordinates,
    zoom: 9
});

map.on("load", function () {
    console.log("✅ MAP LOADED");

    const popup = new maplibregl.Popup({
        offset: 25
    }).setHTML(
        `<h4>${listing.location}</h4>
         <p>Exact Location will be provided after booking</p>`
    );

    new maplibregl.Marker({
        color: "red"
    })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(popup)
        .addTo(map);
});

map.on("error", function (e) {
    console.error("❌ MAP ERROR:", e);
});