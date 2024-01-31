import fetch from "node-fetch";
const fetch1 = await fetch("https://www.ncei.noaa.gov/ords/stations/lcd-buffer/-97.10449218579103/38.0307856936924/1000");
const testing = await fetch1.json();

const fetch2 = await fetch("https://www.ncei.noaa.gov/ords/stations/lcd-buffer/-93.32519531079203/39.84228602061566/1000");
const testing2 = await fetch2.json();

const fetch3 = await fetch("https://www.ncei.noaa.gov/ords/stations/lcd-buffer/-94.73144531079166/33.833919953518176/1000");
const testing3 = await fetch3.json();

const fetch4 = await fetch("https://www.ncei.noaa.gov/ords/stations/lcd-buffer/-109.32128906078778/41.54147766666532/1000");
const testing4 = await fetch4.json();

//https://www.ncei.noaa.gov/ords/stations/lcd-buffer/-76.62597656079646/37.12528628483488/1000
//https://www.ncei.noaa.gov/ords/stations/lcd-buffer/-93.32519531079203/39.84228602061566/1000
//https://www.ncei.noaa.gov/ords/stations/lcd-buffer/-94.73144531079166/33.833919953518176/1000
//https://www.ncei.noaa.gov/ords/stations/lcd-buffer/-109.32128906078778/41.54147766666532/1000
let listOfYearsToWorkWith = [];
let newArray = []
for(let i =0; i < testing.items.length; i++) {
    newArray.push(testing.items[i]);
}

for(let i =0; i < testing.items.length; i++) {
    newArray.push(testing2.items[i]);
}

for(let i =0; i < testing.items.length; i++) {
    newArray.push(testing3.items[i]);
}

for(let i =0; i < testing.items.length; i++) {
    newArray.push(testing4.items[i]);
}


console.log(newArray.length);

import fs from 'fs';

function map_to_object(map) {
    const out = Object.create(null)
    map.forEach((value, key) => {
      if (value instanceof Map) {
        out[key] = map_to_object(value)
      }
      else {
        out[key] = value
      }
    })
    return out
  }

testing.items.sort((a,b) => {
    return new Date(a.data_begin_date) - new Date(b.data_begin_date);
});

let count = 0;

for( let i = 0; i< testing.items.length; i ++)
{
    if(testing.items[i].station_name.includes('AIRPORT')) {
        count ++;
    }
}

const filteredArray = newArray.reduce((acc, current) => {
    const x = acc.find(item => item.station_name == current.station_name);
    if(!x) {
        return acc.concat([current]);
    }
    else {
        return acc;
    }
}, []);

// remove all not operating from sort list
let notOperatingAnymore = 0;
let newArrayFromFiltered = [];
for(let i = 0; i < filteredArray.length; i++) {
    const convertDate = new Date(filteredArray[i].data_end_date);
    if(convertDate.getFullYear() > 2022)
    {
        newArrayFromFiltered.push(filteredArray[i]);
    }
}

console.log("New array length is"+ newArrayFromFiltered.length);

console.log(newArrayFromFiltered.length);
let theMap = new Map();
let mapWithAirportInName = new Map();
for( let i = 0; i< newArrayFromFiltered.length; i ++)
{
    let temp = newArrayFromFiltered[i].data_begin_date;
    const setToDate = new Date(temp);
    const setToDateYear = setToDate.getFullYear();
    if(theMap.get(setToDateYear) == undefined || theMap.get(setToDateYear) ==  null)
    {
        theMap.set(setToDateYear, 1);
        listOfYearsToWorkWith.push(setToDateYear);
        const toupper = newArrayFromFiltered[i].station_name.toUpperCase(); 
        if(toupper.includes("AIRPORT") ||toupper.includes("OIL") ||toupper.includes("PORT")||toupper.includes("BASE"))
        {
            mapWithAirportInName.set(setToDateYear, 1);
        }
        else {
            mapWithAirportInName.set(setToDateYear, 0);
        }
    }
    else {
        const yolo = theMap.get(setToDateYear);
        theMap.set(setToDateYear, yolo+1);
        const toupper = newArrayFromFiltered[i].station_name.toUpperCase(); 
        if(toupper.includes("AIRPORT") ||toupper.includes("OIL") ||toupper.includes("PORT")||toupper.includes("BASE"))
        {
            const yolo2 = mapWithAirportInName.get(setToDateYear) == null ? 1 : mapWithAirportInName.get(setToDateYear);
            mapWithAirportInName.set(setToDateYear, yolo2+1);
        }
    }
}

const justList = map_to_object(theMap);
const listWithAirPorts = map_to_object(mapWithAirportInName);

listOfYearsToWorkWith.sort((a,b) => {
    return a - b;
});

fs.writeFile ("input.json", JSON.stringify(testing), function(err) {
    if (err) throw err;
    console.log('complete');
    }
);

fs.writeFile ("AddedPerYear.json", JSON.stringify(justList), function(err) {
    if (err) throw err;
    console.log('complete');
    }
);

fs.writeFile ("AddedPerYearWithAIRPORTPerYear.json", JSON.stringify(listWithAirPorts), function(err) {
    if (err) throw err;
    console.log('complete');
    }
);

//percentage difference
const stringifyJustList = JSON.stringify(justList);
const stringifyJustListWithAirPort = JSON.stringify(listWithAirPorts);
const backToJsonObject = JSON.parse(stringifyJustList);
const backToJsonObjectWithAirport = JSON.parse(stringifyJustListWithAirPort);
const yolo = listOfYearsToWorkWith[1];
console.log(backToJsonObject[`${yolo}`]);
let totalPerYear = 0;
let totalPerYearWIthAIrport = 0;
for(let i = 0; i < listOfYearsToWorkWith.length; i++) {
    const workingYear = listOfYearsToWorkWith[i];
    totalPerYear += backToJsonObject[workingYear];
    totalPerYearWIthAIrport += backToJsonObjectWithAirport[workingYear];
    const percentage = backToJsonObjectWithAirport[workingYear]/backToJsonObject[workingYear];
    const amountOfGaugesAddedVsAllYearsPreviouslyCombined =  backToJsonObject[workingYear]/totalPerYear;
    console.log("===================================================");
    console.log("Running Total is " + totalPerYear);
    console.log("Working Year is " + workingYear);
    console.log("The percentage of temparture gauges placed at airport or similar in working year " + (percentage * 100));
    console.log("The amount of added compare to existing ones " + (amountOfGaugesAddedVsAllYearsPreviouslyCombined * 100));
    console.log("Amount in this year that were added at airports " + (percentage * 100));
    console.log("Amount of at airport vs not at airport" + (totalPerYearWIthAIrport/totalPerYear) * 100)
}