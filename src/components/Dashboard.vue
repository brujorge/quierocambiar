<template>
    <v-container>
      <v-toolbar
      floating
      dense
      
    >
      <div id="search"></div>
      <v-btn @click="updateUbicacion" icon>
        <v-icon>my_location</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>more_vert</v-icon>
      </v-btn>
    </v-toolbar>
      <v-flex>
        <v-dialog v-model="dialog" persistent max-width="500px">
            <v-btn
              slot="activator"
              color="pink"
              dark
              fixed
              bottom
              right
              fab>
              <v-icon>add</v-icon>
            </v-btn>
          <v-card>
            <v-card-title>
              <span class="headline">Añadir cambista</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12>
                      <v-text-field label="Nombre" v-model="newCambista.name" required></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 m6>
                    <v-text-field label="Longitud" v-model="newCambista.ubicacion.lng" required></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-text-field label="Latitud" v-model="newCambista.ubicacion.lat"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 m6>
                    <v-text-field label="Compra" v-model="newCambista.compra" required></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-text-field label="Venta" v-model="newCambista.venta"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6>
                    <v-select
                      :items="['dolar', 'peso venezolano', 'bolivar']"
                      label="Divisa"
                      v-model="newCambista.divisa"
                      required
                    ></v-select>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
              <v-btn color="blue darken-1" :disabled="loading" flat @click.native="addCambista">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!-- <v-dialog v-model="dialog" max-width="290">
        <v-card>
          <v-card-title class="headline">{{currentFeature.properties.name}}</v-card-title>
          <v-card-text>Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat="flat" @click.native="dialog = false">cerrar</v-btn>
            <v-btn color="green darken-1" flat="flat" @click.native="dialog = false">Agree</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog> -->
        <div id="mapa"></div>
        <div class="map-overlay">
          <v-list two-line>
            <v-list-tile v-if="!features.length" >
              No hay un cambista cerca.
            </v-list-tile>
          <template v-else v-for="feature in features" >
            <v-list-tile @click="getRoute(feature)" :key="feature.name" @mouseout="popup.remove()" @mouseover="setPopup(feature)" id='feature-listing' class='listing'>
              <v-list-tile-content>
                <v-list-tile-title v-html="feature.properties.name"></v-list-tile-title>
                <v-list-tile-sub-title v-html="'COMPRA<strong> S/' +feature.properties.compra+' </strong>'+ 'VENTA <strong> S/' +feature.properties.venta+'</strong>'"></v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            </template>
          </v-list>
        </div>
        <v-card id="directions">
          <v-card-title>
          <div>
            <ul>
              <li v-for="direction in directions" :key="direction.distance">{{direction.maneuver.instruction}}</li>
            </ul>
          </div>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-container>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
export default {
  name: 'dashboard',
  data() {
      return {
        mapa: null,
        popup: new mapboxgl.Popup({
          closeButton: false
        }),
        geocoder: '',
        dialog: false,
        newCambista: {
          name: '',
          compra: '',
          venta: '',
          divisa: '',
          ubicacion: {
            lng: '',
            lat: ''
          }
        },
        newCambistaCopy: {},
        features: [],
        directions: []
      }
  },
  computed: {
    ubicacion(){
      return this.$store.state.ubicacion
    },
    cambistas(){
      return this.$store.state.cambistas
    },
    loading(){
      return this.$store.state.loading
    }
  },
  methods: {
    initMapa(){
      mapboxgl.accessToken = 'pk.eyJ1Ijoic3VnYXJ0YXl0YSIsImEiOiJjamRrZTc2Z2YxOXh1MnFwcnVwamI2OWY3In0.QSF0ljlTpK5bil7mjTUsNg'
      this.mapa = new mapboxgl.Map({
        container: 'mapa',
        center: [this.ubicacion.lng, this.ubicacion.lat],
        zoom: 13,
        style:'mapbox://styles/mapbox/streets-v9'
      })
      this.geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken
        })
      this.mapa.on('style.load',()=>{
        this.updateGeocoderProximity()
        this.getCambistas()
        // CONTROLES
        this.mapa.addControl(new mapboxgl.NavigationControl())
        this.mapa.addControl(new mapboxgl.FullscreenControl()); 
        document.getElementById('search').appendChild(this.geocoder.onAdd(this.mapa))
        // POSICION ACTUAL
        var el = document.createElement('div');
        el.className = 'marker';
        new mapboxgl.Marker(el)
        .setLngLat([this.ubicacion.lng, this.ubicacion.lat])
        .addTo(this.mapa);
        })
      
    },
    getRoute(feature){
      this.$http.get(`https://api.mapbox.com/directions/v5/mapbox/driving/${this.ubicacion.lng},${this.ubicacion.lat};${feature.geometry.coordinates[0]},${feature.geometry.coordinates[1]}?steps=true&language=es&access_token=pk.eyJ1Ijoic3VnYXJ0YXl0YSIsImEiOiJjamRrZTc2Z2YxOXh1MnFwcnVwamI2OWY3In0.QSF0ljlTpK5bil7mjTUsNg&geometries=geojson`)
      .then(response => {
        var ruta = response.body.routes[0].geometry
        this.directions = response.body.routes[0].legs[0].steps
        this.setRoute(ruta)
      })
    },
    setRoute(ruta){
      this.mapa.getSource('directions-source').setData({
        "type": "Feature",
        "properties": {},
        "geometry": ruta
      })
    },
    updateGeocoderProximity() {
        if (this.mapa.getZoom() > 5) {
            var center = this.mapa.getCenter().wrap(); // ensures the longitude falls within -180 to 180 as the Geocoding API doesn't accept values outside this range
            this.geocoder.setProximity({ longitude: center.lng, latitude: center.lat });
        } else {
            this.geocoder.setProximity(null);
        }
      },
    getCambistas(){
      var geojson = {
        type: 'FeatureCollection',
        features: []
      };
      const colRef = this.$store.state.db.collection('cambistas').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          geojson.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [doc.data().ubicacion.lng,doc.data().ubicacion.lat]
          },
          properties: {
            name: doc.data().name,
            estado: doc.data().estado,
            compra: doc.data().compra,
            venta: doc.data().venta,
            id: doc.id
          }
        })
        })
      })
      .then(()=> {
        this.mapa.addSource('directions-source',{
          "type":"geojson",
          "data":{
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type":"LineString",
              "coordinates":[
                [0,0],
                [0.0001,0.0001]
                ]
            }
          }
        })
        this.mapa.addLayer({
          "id":"directions",
          "type": "line",
          "source": "directions-source",
          "paint":{
            // "line-color": "#f13430",
            "line-color": "#1565c0",
            "line-width": 8,
            "line-opacity":0.7
          }
        })
        this.mapa.loadImage('https://i.imgur.com/saA2A5g.png',(error, image) => {
          if(error) throw error
          this.mapa.addImage('moneybag', image)
          this.mapa.addSource("geojson",{
            "type":"geojson",
            "data": geojson
          })
          this.mapa.addLayer({
          "id": "cambistas",
          "type": "symbol",
          "source": "geojson",
          "layout": {
              "icon-image": "moneybag",
              "icon-size": 0.1
          }
          });
          var simplePopup = new mapboxgl.Popup({ closeButton:false})

          this.mapa.on('mouseenter', 'cambistas', (e) => {
            this.mapa.getCanvas().style.cursor = 'pointer';
            var coordinates = e.features[0].geometry.coordinates.slice();
            var properties = e.features[0].properties;
            
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            simplePopup
                .setLngLat(coordinates)
                .setHTML(`<h2>${properties.name}</h2><p>COMPRA: S/${properties.compra}</p><p>COMPRA: S/${properties.venta}</p>`)
                .addTo(this.mapa);
          });
          this.mapa.on('click','cambistas',(e)=>{
            var feature = e.features[0]
            this.getRoute(feature)
          })
          // EVENTOS DEL MAPA
          this.mapa.on('mouseleave', 'cambistas', () => {
            this.mapa.getCanvas().style.cursor = '';
            simplePopup.remove()
          })
          this.mapa.on('moveend',()=> {
            this.updateGeocoderProximity()
            var features = this.mapa.queryRenderedFeatures({layers:['cambistas']});
            if (features) {
              this.renderListing(features)
            }
        });
          // ACTUALIZAR EN TIEMPO REAL
          this.$store.state.db.collection('cambistas').onSnapshot(snapshot=> {
          var nuevosCambistas = {
            type: 'FeatureCollection',
            features: []
          };
            snapshot.forEach(doc => {
              nuevosCambistas.features.push({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [doc.data().ubicacion.lng,doc.data().ubicacion.lat]
                },
                properties: {
                  name: doc.data().name,
                  estado: doc.data().estado,
                  compra: doc.data().compra,
                  venta: doc.data().venta,
                  id: doc.id
                }
              })
            })
            this.mapa.getSource('geojson').setData(nuevosCambistas)
          })
        })
      })
    },
    // ACTUALIZAR LISTADO
    renderListing(features){
      this.features = []
      if(features.length){
        features.forEach(feature => {
          var prop = feature.properties
          this.features.push(feature)
        })
      }
    },
    setPopup(feature){
      this.popup
      .setLngLat(feature.geometry.coordinates)
      .setHTML(`<h2>${feature.properties.name}</h2><p>COMPRA: S/${feature.properties.compra}</p><p>COMPRA: S/${feature.properties.venta}</p>`)
      .addTo(this.mapa)
    },
    addCambista(){
      this.$store.commit('SET_LOADING', true) 
      const colRef = this.$store.state.db.collection('cambistas').add({
        name: this.newCambista.name,
        compra: this.newCambista.compra,
        venta: this.newCambista.venta,
        divisa: this.newCambista.divisa,
        estado: 1,
        ubicacion: {
          lng: this.newCambista.ubicacion.lng,
          lat: this.newCambista.ubicacion.lat
        }
      }).then(()=> {
        this.$store.commit('SET_LOADING', null) 
        this.resetCambista()
      })

    },
    resetCambista(){
      this.dialog = false
      this.newCambista = {...this.newCambistaCopy}
    },
    updateUbicacion(){
      if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(position => {
        this.$store.dispatch('getPosition', {lat: position.coords.latitude, lng: position.coords.longitude})
        .then(()=>{ 
          this.mapa.flyTo({center: [this.ubicacion.lng, this.ubicacion.lat], zoom: 14})
        })
      }, error => {
          console.log(error);
      })
    } else {
      alert('Cannot access geolocation');
    }
    }
  },
  mounted(){
    this.newCambistaCopy = {...this.newCambista}
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(position => {
        this.$store.dispatch('getPosition', {lat: position.coords.latitude, lng: position.coords.longitude})
        .then(()=>{ 
          this.initMapa()
        })
      }, error => {
          console.log(error);
      })
    } else {
      alert('Cannot access geolocation');
    }
  }
}
</script>
<style>
 #mapa {
 position:absolute;
    left:20%;
    top:64px;
    bottom:0;
    width: 80%;
  } 
.marker {
  background-image: url("../assets/me.png");
  background-size: cover;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
.mapboxgl-popup {
  max-width: 300px;
}

.mapboxgl-popup-content {
  text-align: center;
  font-family: 'Open Sans', sans-serif;
}
.mapboxgl-popup-content p{
  margin-bottom: 0;
}
.map-overlay {
    position: absolute;
    width: 20%;
    top: 64px;
    bottom: 0;
    left: 0;
}
.map-overlay .listing {
    overflow: auto;
    max-height: 100%;
}

.map-overlay .listing > * {
    display: block;
    padding: 5px 10px;
    margin: 0;
}
.toolbar--floating {
  z-index:5;
  position:fixed;
  left:22%;
}
#directions {
  position:fixed;
  bottom:50px;
  left:22%;
  width:250px;
  max-height:300px;
  overflow: auto;
  background: white;
  padding:10px 10px 10px 25px;
  font-size:12px;
}

</style>

