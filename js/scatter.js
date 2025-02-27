class Scatterplot {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1300,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || { top: 40, right: 40, bottom: 20, left: 50 },
      tooltipPadding: _config.tooltipPadding || 15,
    };
    this.data = _data;
    this.initVis();
    this.updateVis();
  }

  initVis() {
    let vis = this;
    console.log(vis.data);

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    vis.xScale = d3.scaleLinear().range([0, vis.width]);

    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale);

    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    vis.xAxisG = vis.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vis.height})`);

    vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

    // Append both axis titles
    vis.chart
      .append("text")
      .attr("class", "axis-title")
      .attr("y", vis.height - 15)
      .attr("x", vis.width + 10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Employed Population");

    vis.svg
      .append("text")
      .attr("class", "axis-title")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dy", ".71em")
      .text("Median Household Income ($)");

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.xValue = (d) => d.Value_y;
    vis.yValue = (d) => d.Value;

    vis.xScale.domain([0, d3.max(vis.data, vis.xValue)]);
    vis.yScale.domain([1, d3.max(vis.data, vis.yValue)]);
    vis.xAxis.ticks(5);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    vis.chart
      .selectAll(".point")
      .data(vis.data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (d) => vis.xScale(vis.xValue(d)))
      .attr("cy", (d) => vis.yScale(vis.yValue(d)))
      .attr("r", 2)
      .attr("fill", "steelblue")
      .attr("stroke", "black")
      .attr("opacity", 0.8);

    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);

    vis.chart
      .selectAll(".point")
      .on("mousemove", (d) => {
        d3
          .select("#tooltip2")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
              <div class="tooltip-title">County: ${d.FIPS}</div>
              <div><i>Percent Foreign Born Citizen:</i> ${d.Value_x}%</div>
              <div><i>Employed population:</i> ${d.Value_y}</div>
              <div><i>Median Household Income:</i> ${d.Value}$</div>
            `);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      });
  }
}
