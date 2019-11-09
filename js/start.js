'use strict';


let data = "no data";
let allYearsData = "no data";
let svgScatterPlot = ""; // keep SVG reference in global scope
let funcs = "";
let selected = "";
let dropDown = "";

const m = {
    width: 600,
    height: 600,
    marginAll: 50
}

// load data and make scatter plot after window loads
svgScatterPlot = d3.select('body')
  .append('svg')
  .attr('width', m.width + 500)
  .attr('height', m.height);

// d3.csv is basically fetch but it can be be passed a csv file as a parameter
d3.csv("gapminder.csv")
  .then((csvData) => {
    data = csvData
    allYearsData = csvData
    funcs = makeAxesAndLabels()
    makeScatterPlot(1980, funcs) // initial scatter plot
})

function makeAxesAndLabels() {
    // get fertility_rate and life_expectancy arrays
    const fertilityData = data.map((row) => parseFloat(row["fertility"]))
    const lifeData = data.map((row) => parseFloat(row["life_expectancy"]))

    // find limits of data
    const limits = findMinMax(fertilityData, lifeData);

    // draw axes and return scaling + mapping functions
    const funcs = drawAxes(limits, "fertility", "life_expectancy", svgScatterPlot,
        {min: m.marginAll + 450, max: (m.width - m.marginAll) + 450}, {min: m.marginAll, max: m.height - m.marginAll});

    // draw title and axes labels
    makeLabels();
    return funcs;
}


// make scatter plot with trend line
function makeScatterPlot(year, funcs) {
  filterByYear(year);

  // plot data as points and add tooltip functionality
  plotData(funcs);
}

function filterByYear(year) {
  data = allYearsData.filter((row) => row['year'] == year);
}

// make title and axes labels
function makeLabels() {
  svgScatterPlot.append('text')
    .attr('x', 640)
    .attr('y', 30)
    .attr('id', "title")
    .style('font-size', '14pt')
    .text("Fertility vs Life Expectancy (1980)");

  svgScatterPlot.append('text')
    .attr('x', 750)
    .attr('y', 590)
    .attr('id', "x-label")
    .style('font-size', '12pt')
    .text('Fertility');

  svgScatterPlot.append('text')
    .attr('transform', 'translate(450, 350)rotate(-90)')
    .style('font-size', '12pt')
    .text('Life Expectancy');
}

// plot all the data points on the SVG
// and add tooltip functionality
function plotData(map) {
  // get population data as array
  let pop_data = data.map((row) => +row["population"]);
  let pop_limits = d3.extent(pop_data);
  // make size scaling function for population
  let pop_map_func = d3.scaleLinear()
  .domain([pop_limits[0], pop_limits[1]])
  .range([3, 20]);

  // mapping functions
  let xMap = map.x;
  let yMap = map.y;

  // make tooltip
  let div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)

  // append data to SVG and plot as points
  var circles = svgScatterPlot.selectAll('.dot')
  .data(data)
  .enter()
  .append('circle')
  .attr('cx', xMap)
  .attr('cy', yMap)
  .attr('r', (d) => pop_map_func(d["population"]) * 1.5)
  .attr('fill', 'white')
  .attr('stroke', '#0066cc')
  .attr('stroke-width', '2')
  // add tooltip functionality to points
  .on("mouseover", (d) => {
    div.transition()
    .duration(200)
    .style("width", 550 + "px")
    .style("height", "auto")
    .style("opacity", .9)
    div.html(
      littleGraph(d["country"])
    )
    .style("left", (d3.event.pageX + 15) + "px")
    .style("top", (d3.event.pageY - 28) + "px")
  })
  .on("mouseout", (d) => {
    div.transition()
    .duration(500)
    .style("opacity", 0);
  });
}

// draw the axes and ticks
function drawAxes(limits, x, y, svg, rangeX, rangeY) {
  // return x value from a row of data
  let xValue = function(d) { return +d[x]; }

  // function to scale x value
  let xScale = d3.scaleLinear()
    .domain([limits.xMin, limits.xMax]) // give domain buffer room
    .range([rangeX.min, rangeX.max]);

  // xMap returns a scaled x value from a row of data
  let xMap = function(d) { return xScale(xValue(d)); };

  // plot x-axis at bottom of SVG
  let xAxis = d3.axisBottom().scale(xScale);
  svg.append("g")
    .attr('transform', 'translate(0, ' + rangeY.max + ')')
    .attr('id', "x-axis")
    .call(xAxis);

  // return y value from a row of data
  let yValue = function(d) { return +d[y]}

  // function to scale y
  let yScale = d3.scaleLinear()
    .domain([limits.yMax, limits.yMin]) // give domain buffer
    .range([rangeY.min, rangeY.max]);

  // yMap returns a scaled y value from a row of data
  let yMap = function (d) { return yScale(yValue(d)); };

  // plot y-axis at the left of SVG
  let yAxis = d3.axisLeft().scale(yScale);
  svg.append('g')
    .attr('transform', 'translate(' + rangeX.min + ', 0)')
    .attr('id', "y-axis")
    .call(yAxis);

  // return mapping and scaling functions
  return {
    x: xMap,
    y: yMap,
    xScale: xScale,
    yScale: yScale
  };
}

// find min and max for arrays of x and y
function findMinMax(x, y) {

  // get min/max x values
  let xMin = d3.min(x);
  let xMax = d3.max(x);

  // get min/max y values
  let yMin = d3.min(y);
  let yMax = d3.max(y);

  // return formatted min/max data as an object
  return {
    xMin : xMin - 0.5,
    xMax : xMax,
    yMin : yMin - 5,
    yMax : yMax
  }
}


function littleGraph(country) {
  const margin = {top: 50, right: 50, bottom: 50, left: 50}
  , width = 500 - margin.left - margin.right // Use the window's width
  , height = 400 - margin.top - margin.bottom // Use the window's height

  // load data
  d3.csv('gapminder.csv').then((data1) => {
    // make an svg and append it to body
    const svg = d3.select('div').append("svg")
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)

    svg.append('text')
      .attr('x', 130)
      .attr('y', 35)
      .attr('id', "title")
      .style('font-size', '14pt')
      .text("Year vs Population for " + country);

    svg.append('text')
      .attr('x', 250)
      .attr('y', 390)
      .attr('id', "x-label")
      .style('font-size', '11pt')
      .text('Year');

    svg.append('text')
      .attr('transform', 'translate(12, 250)rotate(-90)')
      .style('font-size', '11pt')
      .text('Population (Million)');

    // get only data for USA
    data1 = data1.filter(d => d['country'] == country && d['population'] != "NA")

    // get year min and max for us
    const yearLimits = d3.extent(data1, d => d['year'])

    // get scaling function for years (x axis)
    const xScale = d3.scaleLinear()
      .domain([yearLimits[0], yearLimits[1]])
      .range([margin.left, width + margin.left])

    // make x axis
    const xAxis = svg.append("g")
      .attr("transform", "translate(0," + (height + margin.top) + ")")
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))

    // get min and max population
    const popLimits = d3.extent(data1, d => parseInt(d['population']))

    // get scaling function for y axis
    const yScale = d3.scaleLinear()
      .domain([popLimits[1] / 1000000, popLimits[0] / 1000000])
      .range([margin.top, margin.top + height])

    // make y axis
    const yAxis = svg.append("g")
      .attr("transform", "translate(" + margin.left + ",0)")
      .call(d3.axisLeft(yScale))

    // use d3 line generator to make a line
    // // d3's line generator
    const line = d3.line()
      .x((d) => xScale(d['year']))
      .y((d) => yScale(d['population']/1000000))

    // append line to svg
    // data vs datum
    // path
    svg.append('path')
      .datum(data1)
      .attr("d", line)
      .attr("stroke", "steelblue")

    // append dots to svg to track data points
    svg.selectAll('.dot').data(data1)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d['year']))
      .attr('cy', d => yScale(d['population']/1000000))
      .attr('r', 4)
      .attr('fill', 'steelblue')
  })
}
