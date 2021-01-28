let map = L.map('mapid').on('load', onMapLoad).setView([41.400, 2.206], 11);
//map.locate({setView: true, maxZoom: 17});

let tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

//en clusters almaceno todos los markers
let markers = L.markerClusterGroup();
let data_markers = [];

function onMapLoad() {

    console.log("Mapa cargado");
    /*
	FASE 3.1
		1) Relleno el data_markers con una petición a la api
		2) Añado de forma dinámica en el select los posibles tipos de restaurantes
		3) Llamo a la función para --> render_to_map(data_markers, 'all'); <-- para mostrar restaurantes en el mapa
	*/
    $.ajax({
        type: "POST",
        url: "http://localhost:8080/mapa/api/apiRestaurants.php",
        dataType: "json",
        success: function(data) {
            let kind = [];

            data.forEach(function(item) {
                data_markers.push(item);

                let food = (item.kind_food).split(",");
                food.forEach(function(value) {
                    kind.push(value);
                });
            });

            let kind_filter = [];
            let kind_object = {};

            kind.forEach(element => {
                if (!(element in kind_object)) {
                    kind_object[element] = true;
                    kind_filter.push(element);
                }
            });

            kind_filter.unshift("Todos");
            kind_filter.forEach(function(value) {
                $("#kind_food_selector").append("<option>" + value + "</option>");
            });
            render_to_map(data_markers, "Todos");
        }
    });
}

$("#kind_food_selector").on("change", function() {
    console.log(this.value);
    render_to_map(data_markers, this.value);
});

function render_to_map(data_markers, filter) {
    /*
    FASE 3.2
    	1) Limpio todos los marcadores
    	2) Realizo un bucle para decidir que marcadores cumplen el filtro, y los agregamos al mapa
    */

    markers.clearLayers();

    let marker;

    for (let i = 0; i < data_markers.length; i++) {
        let type = data_markers[i].kind_food;
        if (filter === "Todos" || (type.split(",").includes(filter))) {
            marker = L.marker([data_markers[i].lat, data_markers[i].lng], data_markers[i].name, data_markers[i].address);
            marker.addTo(markers);
            marker.bindPopup(
                "<p>Restaurante: " + data_markers[i].name + "</p> <p>Tipo de comida: " + data_markers[i].kind_food + "</p> <p>Dirección: " + data_markers[i].address + "</p>");
            markers.addLayer(marker);
        }
    }
    map.addLayer(markers);
}
