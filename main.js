// console.log("Hello world");
// let data, timelineCircles;

// d3.csv('./data.csv')
//   .then(_data => {
//   	console.log('Data loading complete. Work with dataset.');
//   	data = _data;
//     console.log(data);

//     //process the data - this is a forEach function.  You could also do a regular for loop....
//     data.forEach(d => { //ARROW function - for each object in the array, pass it as a parameter to this function

//   	});

// })
// .catch(error => {
//     console.error('Error:');
//     console.log(error);
// });

// /**
//  * Event listener: use color legend as filter
//  */
// d3.selectAll('.legend-btn').on('click', function() {
//   console.log("button! ");
//   // Toggle 'inactive' class
//   d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));

//   // Check which categories are active
//   let selectedCategory = [];
//   d3.selectAll('.legend-btn:not(.inactive)').each(function() {
//     selectedCategory.push(d3.select(this).attr('category'));
//   });

//   // Filter data accordingly and update vis
//   timelineCircles.data = data.filter(d => selectedCategory.includes(d.category)) ;
//   timelineCircles.updateVis();

// });

/**
 * Load TopoJSON data of the world and the data of the world wonders
 */

Promise.all([d3.json("data/counties-10m.json"), d3.csv("data/data.csv")])
  .then((data) => {
    const geoData = data[0];
    const avgIncome = data[1];

    // Combine both datasets by adding the income to the TopoJSON file
    // console.log(geoData);
    geoData.objects.counties.geometries.forEach((d) => {
      // console.log(d);
      for (let i = 0; i < avgIncome.length; i++) {
        if (d.id === avgIncome[i].FIPS) {
          d.properties.Value = +avgIncome[i].Value;
        }
      }
    });
    console.log(geoData);

    const choroplethMap = new ChoroplethMap(
      {
        parentElement: ".viz",
      },
      geoData
    );
    choroplethMap.updateVis("Value");
  })
  .catch((error) => console.error(error));
