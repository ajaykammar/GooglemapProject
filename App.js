import React, { useRef, useState, useEffect } from "react";
import { Alert , Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from "react-native-maps";
import { decode } from "@mapbox/polyline";
import Icon from 'react-native-vector-icons/FontAwesome';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Voice from '@react-native-voice/voice';
import axios from 'axios';
export default function App() {

  // *********   Motion Sensor interface *********

  const [motionState, setMotionState] = useState('No Motion Detected');
  useEffect(() => { const interval = setInterval(() => {
      axios.get('http://192.168.0.100/')
      .then(response => { setMotionState(response.data);})
      .catch(error => { console.log(error); }); },500);
          return () => clearInterval(interval);
        });

  (motionState == "Motion Detected.")?
  Alert.alert("alert","alert particles detected in 1 mt ahead !!!!!!")
  :{}


  
  {/* *******    Recoding *********** */ }
  const [Result, setResult] = useState('')
  const [error, seterror] = useState('')
  const [Recording, setRecording] = useState(false)

  Voice.onSpeechStart = () => setRecording(true);
  Voice.onSpeechEnd = () => setRecording(false);
  Voice.onSpeechError = (err) => seterror(err.error);
  Voice.onSpeechResults = (result) => setResult(result.value[0]);

  const startRecording = async () => {
    try { await Voice.start('en-us'); }
    catch (err) { seterror(err) }
  }

  const stopRecording = async () => {
    try { await Voice.stop }
    catch (err) { seterror(err) }
  }

  // **********  Map *********
  const [CurrentREG , setCurrentREG]=  useState( {latitude: 15.9071262,
                                                  longitude: 74.5184459,});
  const mapRef = useRef(null);
  const [region, setRegion] = useState({latitude: 15.9071262,
                                        longitude: 74.5184459,
                                        latitudeDelta: 0.0922,
                                        longitudeDelta: 0.0421,});

  const [UpdateRegin, setUpdateRegin] = useState({ latitude: 0,
                                                   longitude: 0,
                                                   dest:"location"})

  const newRegin = { latitude: 15.9071262,
                     longitude: 74.5184459,
                     latitudeDelta: 0.0922,
                     longitudeDelta: 0.0421, }
  const [place , setplace]= useState("");

  const Mylocation = () => {   
     mapRef.current.animateToRegion(newRegin, 3 * 1000);  
     Alert.alert("Select Current Location") 
     setCurrentREG({latitude: region.latitude,
                    longitude: region.longitude, })
  }

  const [coords, setCoords] = useState([]);

  useEffect(() => {
    //fetch the coordinates and then store its value into the coords Hook.
    getDirections(`${CurrentREG.latitude},${CurrentREG.longitude}`, `${UpdateRegin.latitude},${UpdateRegin.longitude}`)
      .then(coords => setCoords(coords))
      .catch(err => console.log("Something went wrong")); 
  }, [region]);

  const getDirections = async (region, newRegin) => {
    try {
      const KEY = "AIzaSyB5nKHsxH0NCqgewaLdiq4RtIQ34Zp9LE0"; //put your API key here.
      //otherwise, you'll have an 'unauthorized' error.
      let resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${region}&destination=${newRegin}&key=${KEY}`
      );
      let respJson = await resp.json();
      let points = decode(respJson.routes[0].overview_polyline.points);
      console.log(points);
      let coords = points.map((point, index) => {
        return {latitude: point[0],longitude: point[1]}; });
      return coords;
    } catch (error) { return error; }
  };


  return (
    <View style={styles.container}>
      <View style={styles.MapContainer}>
        {/*Render our MapView*/}
        <MapView
          style={styles.map}
          //specify our coordinates.
          initialRegion={{
            latitude: 15.9071262,
            longitude: 74.5184459,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onRegionChangeComplete={(region) => {setRegion(region)
                                               console.log(region);}}
          ref={mapRef}>
          <Marker coordinate={CurrentREG} />                      
          <Marker coordinate={UpdateRegin} />
          {console.log(`${JSON.stringify(CurrentREG)}`)}
          <Polyline coordinates={coords} />
        </MapView>

        {/* *******    Search Box *********** */}
        <View style={styles.searchBar}>
          <Text >  
            <GooglePlacesAutocomplete
                    placeholder='Search'
                    fetchDetails={true}
                    autofocuse={true}
                    value={Result}
                    onChangeText={(text) => setResult(text)}
                    onPress={(data, details = null) => {
                    setUpdateRegin(
                      {latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                           dest: details.address_components }
                           );
               
                 UpdateRegin.dest.map((items)=>{setplace(items.long_name); })
            }}
            query={{
              key: "AIzaSyB5nKHsxH0NCqgewaLdiq4RtIQ34Zp9LE0",
              language: 'en',            
            }}/>
          </Text>
        </View>


        {/* **********    Recoder BTN   *********** */}
        <TouchableOpacity
          onPress={Recording ? stopRecording : startRecording}
          
          >
          <Text style={{ margin: 30, fontSize: 20, display:"flex"}} >
            {Recording ?  <><Icon name="microphone" size={100} color="#900" /> {"stopRecording" }</> 
            : <><Icon name="microphone" size={100} color="#000" />  </>}
          </Text>
        </TouchableOpacity>

        <Button title="Current Location" 
          onPress={() => Mylocation()}>
        </Button>

        <Text style={styles.text}>You destination : {Result} </Text>
        <Text style={styles.text}>Current latitude: {region.latitude}</Text>
        <Text style={styles.text}>Current longitude: {region.longitude}</Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchBar: {
    width: "100%",
    height: "10%",
    paddingTop: "9%",
    backgroundColor: "",
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  MapContainer: {
    ...StyleSheet.absoluteFillObject,
    flex: 1, //the container will fill the whole screen.
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  text: {
    display: "flex",
    backgroundColor: "white",
    width: "100%", height: "4%",
    textAlign: 'center',
    margin: 'auto',
    padding: "1%"
  },
  Btn:{
   
  }
});



