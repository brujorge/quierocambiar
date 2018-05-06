<template>
    <v-container>
      <v-flex>
        <v-btn @click.native="addCambista">Add cambista</v-btn>
        <div id="mapa"></div>
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
      }
  },
  computed: {
    ubicacion(){
      return this.$store.state.ubicacion
    },
    cambistas(){
      return this.$store.state.cambistas
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
      this.mapa.on('style.load',()=>{
        this.getCambistas()
        this.mapa.addControl(new mapboxgl.NavigationControl())
        this.mapa.addControl(new mapboxgl.FullscreenControl());
        var el = document.createElement('div');
        el.className = 'marker';
        new mapboxgl.Marker(el)
        .setLngLat([this.ubicacion.lng, this.ubicacion.lat])
        .addTo(this.mapa);
        })
      
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
          }
        })
        })
      })
      .then(()=> {
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
          this.mapa.on('click', 'cambistas', (e) => {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var properties = e.features[0].properties;
            
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`<h2>${properties.name}</h2><p>COMPRA: S/${properties.compra}</p><p>COMPRA: S/${properties.venta}</p>`)
                .addTo(this.mapa);
          });
          this.mapa.on('mouseenter', 'places', () => {
          this.mapa.getCanvas().style.cursor = 'pointer';
          });
          this.mapa.on('mouseleave', 'places', () => {
              map.getCanvas().style.cursor = '';
          });
          this.$store.state.db.collection('cambistas').onSnapshot(snapshot=> {
          var nuevosCambistas = {
            type: 'FeatureCollection',
            features: []
          };
            console.log(snapshot);
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
                }
              })
            })
            this.mapa.getSource('geojson').setData(nuevosCambistas)
          })
        })
      })
    },
    addCambista(){
      const colRef = this.$store.state.db.collection('cambistas').add({
        compra: 11111,
        venta: 22222,
        estado: 1,
        name: 'SALUDOS DESDE OTRO CLIENTE',
        ubicacion: {
          lng: -77.006709,
          lat: -12.1893128
        }
      })
    }
  },
  mounted(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(position => {
        this.$store.dispatch('getPosition', {lat: position.coords.latitude, lng: position.coords.longitude})
        .then(()=>{ 
          this.initMapa()
        })
        // this.room = this.db.collection('rooms').doc(geohash)
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
  min-width:100%;
  height: 500px;
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
</style>

