class ChoroplethMap {
  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || { top: 10, right: 10, bottom: 10, left: 10 },
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12,
      legendRectWidth: 150,
    };
    this.data = _data;
    // this.config = _config;

    this.us = _data;

    this.active = d3.select(null);

    this.initVis();
    this.updateVis();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;
    console.log(vis.data);

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("class", "center-container")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    vis.svg
      .append("rect")
      .attr("fill", "none")
      .attr("class", "background center-container")
      .attr("height", vis.config.containerWidth) //height + margin.top + margin.bottom)
      .attr("width", vis.config.containerHeight) //width + margin.left + margin.right)
      .on("click", vis.clicked);

    vis.projection = d3
      .geoAlbersUsa()
      .translate([vis.width / 2, vis.height / 2])
      .scale(vis.width);

    // vis.colorScale = d3
    //   .scaleLinear()
    //   .domain(
    //     d3.extent(
    //       vis.data.objects.counties.geometries,
    //       (d) => d.properties.Value
    //     )
    //   )
    //   .range(["#f7fcf5", "#00441b"])
    //   .interpolate(d3.interpolateHcl);

    vis.path = d3.geoPath().projection(vis.projection);

    vis.g = vis.svg
      .append("g")
      .attr("class", "center-container center-items us-state")
      .attr(
        "transform",
        "translate(" +
          vis.config.margin.left +
          "," +
          vis.config.margin.top +
          ")"
      )
      .attr(
        "width",
        vis.width + vis.config.margin.left + vis.config.margin.right
      )
      .attr(
        "height",
        vis.height + vis.config.margin.top + vis.config.margin.bottom
      );

    vis.g
      .append("path")
      .datum(
        topojson.mesh(vis.us, vis.us.objects.states, function (a, b) {
          return a !== b;
        })
      )
      .attr("id", "state-borders")
      .attr("d", vis.path);
  }

  updateVis(attribute) {
    let vis = this;
    let colorRange = (attr) => {
      if (attr === "Value") {
        return ["#f7fcf5", "#00441b"];
      } else if (attr === "Value_x") {
        return ["#fcfbfd", "#3f007d"];
      } else if (attr === "Value_y") {
        return ["#ffffe5", "#004529"];
      }
      return ["#f7fbff", "#08306b"];
    };
    const mock = d3.extent(vis.data.objects.counties.geometries, (d) => {
      // console.log(d.properties.Value);
      return d.properties.Value;
    });
    // update new color scale for data change + rerender the whole visualization for counties
    vis.colorScale = d3
      .scaleLinear()
      .domain(
        d3.extent(vis.data.objects.counties.geometries, (d) => {
          // console.log(d.properties.Value);
          return d.properties[attribute];
        })
      )
      .range(colorRange(attribute))
      // .range(["#f7fbff", "#08306b"])
      .interpolate(d3.interpolateHcl);

    vis.counties = vis.g
      .append("g")
      .attr("id", "counties")
      .selectAll("path")
      .data(topojson.feature(vis.us, vis.us.objects.counties).features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("d", vis.path)
      .attr("fill", (d) => {
        if (d.properties[attribute]) {
          return vis.colorScale(d.properties[attribute]);
        } else {
          return "url(#lightstripe)";
        }
      });

    // Interaction
    vis.counties
      .on("mousemove", (d, event) => {
        // console.log(d);
        // console.log(event);
        if (attribute === "Value") {
          const tooltipData = d.properties[attribute]
            ? // this should be change after strong tag to match what kind of data is beng shown
              // may need further logic to adjust the content of the tooltip
              `<strong>${d.properties[attribute]}$</strong> Median Household Income`
            : "No data available";
          d3
            .select("#tooltip")
            .style("display", "block")
            .style("left", event.pageX + vis.config.tooltipPadding + "px")
            .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                      <div class="tooltip-title">${d.properties.name}</div>
                      <div>${tooltipData}</div> `);
        } else if (attribute === "Value_x") {
          const tooltipData = d.properties[attribute]
            ? `<strong>${d.properties[attribute]}%</strong> Percent of Population that are Immigrants`
            : "No data available";
          d3
            .select("#tooltip")
            .style("display", "block")
            .style("left", event.pageX + vis.config.tooltipPadding + "px")
            .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                      <div class="tooltip-title">${d.properties.name}</div>
                      <div>${tooltipData}</div> `);
        } else {
          const tooltipData = d.properties[attribute]
            ? `<strong>${d.properties[attribute]}</strong> Employed Population`
            : "No data available";
          d3
            .select("#tooltip")
            .style("display", "block")
            .style("left", event.pageX + vis.config.tooltipPadding + "px")
            .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                      <div class="tooltip-title">${d.properties.name}</div>
                      <div>${tooltipData}</div> `);
        }
      })
      .on("click", function (d) {
        d3.selectAll(".county").style("opacity", "0.2");
        d3.select(this).attr("class", "active");
        d3.selectAll(".active").style("opacity", "1");
      })
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut);
  }
}

// later use of mouse over for highlight
let mouseOver = function (d) {
  d3.select(this)
    .transition()
    .duration(100)
    .style("stroke", "#5555ff")
    .style("stroke-width", 1.5);
};

let mouseOut = function (d) {
  d3.select(this).transition().duration(100).style("stroke", "none");

  // Unshow tooltip
  d3.select("#tooltip").style("display", "none");
};
