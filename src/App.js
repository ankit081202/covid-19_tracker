import {FormControl, MenuItem,Select,Card, CardContent, } from "@material-ui/core";
import './App.css';

import Table from "./Table";
import {useState,useEffect} from "react"
import InfoBox from "./InfoBox";
import Map from "./Map";
import {sortData} from './util'
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
function App() {

  const[countries,setCountries] = useState([]);
  const[country,setCountry] = useState('worldwide');
  const[countryInfo, setCountryInfo] = useState({});
  const[tableData,setTableData] =  useState([]);
  const[mapCenter,setMapCenter] = useState({lat: 34.80746, lng: -40.4796})
  const[mapZoom,setMapZoom] =useState(3);
  const[mapCountries,setMapCountries]=useState([]);
  const[casesType,setCasesType] = useState('cases');
  useEffect(() => {
      fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      })
  },[]);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          { name: country.country,
            value: country.countryInfo.iso2
          }
        ));

        const sortedData = sortData(data)
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      })
    }
    getCountriesData();
  },[]);

  const onCountryChange = async (event) =>{
    const countryCode = event.target.value;
    const url = countryCode === "worldwide" ? "https://disease.sh/v3/covid-19/all" : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      setCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
     
    });
  };
  return (
    <div className="App">
      <div className="app_left">
        <div className="app_header">
          <h1>COVID-19 Tracker</h1>
          <FormControl className="app_dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange = {onCountryChange}
            >
              <MenuItem value='worldwide'>worldwide</MenuItem>
              {countries.map((country)=>(
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app_stats">
          <InfoBox isRed active= {casesType === 'cases'} onClick = {e => setCasesType('cases')} title='Coronavirus Cases' cases={countryInfo.todayCases} total = {countryInfo.cases}/>
          <InfoBox active= {casesType === 'recovered'} onClick = {e => setCasesType('recovered')} title='Recovered' cases={countryInfo.todayRecovered} total = {countryInfo.recovered} />
          <InfoBox isRed active= {casesType === 'deaths'} onClick = {e => setCasesType('deaths')} title='Deaths' cases={countryInfo.todayDeaths} total = {countryInfo.deaths} />
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom = {mapZoom}
          
        />
      </div>
      <Card className="app_right">
          <CardContent>
            <h3>Live Cases by country</h3>
            <Table countries ={tableData} />
            
          </CardContent>
      </Card>
    </div>

  );
}

export default App;
