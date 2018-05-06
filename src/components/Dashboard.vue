<template>
    <v-container>
      <v-flex>
        {{cambistas}}
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
          })
        
      },
      getCambistas(){
        this.$store.dispatch('getCambistas')
        .then((response)=>{
          let geojson = this.$store.state.cambistas
          this.mapa.addSource('cambistas-source',{type:'geojson', data: geojson})
          this.mapa.addLayer({
              "id": "points",
              "type": "symbol",
              "source": "cambistas-source",
              "layout": {
                  "icon-image": "{icon}-15",
                  "text-field": "{title}",
                  "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                  "text-offset": [0, 0.6],
                  "text-anchor": "top"
              }
          });
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
  min-width:1000px;
  height: 500px;
  }
  .marker {
  background-image: url("https://i.imgur.com/saA2A5g.png");
  background-size: cover;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
}
</style>

