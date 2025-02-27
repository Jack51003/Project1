const numAttr = ["Value", "Value_x", "Value_y"]; // all number attributes
let choroplethMap; // global variable for the ChoroplethMap object
let scatterplot; // global variable for the Scatterplot object

Promise.all([d3.json("data/counties-10m.json"), d3.csv("data/data.csv")])
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

    // // Scatterplot
    // scatterplot = new Scatterplot(
    //   {
    //     parentElement: ".viz",
    //   },
    //   geoData
    // );

    // // Update scatterplot for first time
    // scatterplot.updateVis("Value");
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
