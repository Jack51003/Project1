const numAttr = ["Value", "Value_x", "Value_y"]; // all number attributes
let choroplethMap; // global variable for the ChoroplethMap object
let scatterplot; // global variable for the Scatterplot object
let countyFilter = []; // global variable for the county filter

Promise.all([d3.json("/counties-10m.json"), d3.csv("/data.csv")])
  .then((data) => {
    const geoData = data[0];
    const values = data[1];
    // take all columns names except the first one (FIPS)
    const allAttr = Object.keys(values[0]).slice(1);

    // Combine both datasets by adding the income to the TopoJSON file
    // console.log(geoData);
    geoData.objects.counties.geometries.forEach((d) => {
      // console.log(d);
      for (let i = 0; i < values.length; i++) {
        if (d.id === values[i].FIPS) {
          // add all attributes to the properties of the GeoJSON file
          numAttr.forEach((attr) => {
            d.properties[attr] = +values[i][attr];
          });
          // console.log(d.properties);
        }
      }
    });

    // bar
    // barChart = new Barchart(
    //   {
    //     parentElement: "#bar",
    //   },
    //   values
    // );

    // // Update barchart for first time
    // barChart.updateVis("Value");

    // scatterplot
    scatterplot = new Scatterplot(
      {
        parentElement: "#scatter",
      },
      values
    );
    // Update scatterplot for first time
    scatterplot.updateVis("Value");
    // init choropleth map
    choroplethMap = new ChoroplethMap(
      {
        parentElement: ".viz",
      },
      geoData
    );
    // update for first time
    choroplethMap.updateVis("Value");
  })
  .catch((error) => console.error(error));

// Event listener: use dropdown menu to select attribute
const currentAttr = document.getElementById("dataSelect");
currentAttr.addEventListener("change", (event) => {
  // call updateVis with the selected attribute
  choroplethMap.updateVis(event.target.value);
});

// // Filter county with the choropleth map (I could not get this working... I think the way I'm
// parsing my data could be better...)
// function filterData() {
//   if (countyFilter.length === 0) {
//     // if no county is selected, show all counties
//     scatterplot.data = data;
//   } else {
//     // filter data based on countyFilter
//     scatterplot.data = data.filter((d) =>
//       countyFilter.includes(d.properties.name)
//     );
//   }
//   scatterplot.updateVis();
// }
