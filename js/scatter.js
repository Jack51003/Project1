class Scatterplot {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 25, right: 20, bottom: 20, left: 35 },
      tooltipPadding: _config.tooltipPadding || 15,
    };
    this.data = _data;
    this.initVis();
  }

  initVis() {
    let vis = this;

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

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.xValue = (d) => d.Value_x;
    vis.yValue = (d) => d.Value_y;
    vis.zValue = (d) => d.Value;

    vis.xScale.domain(d3.extent(vis.data, vis.xValue));
    vis.yScale.domain(d3.extent(vis.data, vis.yValue));

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
      .attr("r", (d) => vis.zValue(d) / 1000)
      .attr("fill", "steelblue")
      .attr("opacity", 0.7);

    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);

    vis.chart
      .selectAll(".point")
      .on("mouseover", (event, d) => {
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
              <div class="tooltip-title">FIPS: ${d.FIPS}</div>
              <div><i>Value X:</i> ${d.Value_x}</div>
              <div><i>Value Y:</i> ${d.Value_y}</div>
              <div><i>Value:</i> ${d.Value}</div>
            `);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      });
  }
}
