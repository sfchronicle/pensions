require("./lib/social"); //Do not delete
var d3 = require('d3');

// Parse the date / time
var parseYear = d3.timeParse("%Y");

var svg, x, y;

// colors
function color_by_dataset(dataset) {
  if (dataset == "historical") {
    return "#C10326";
  } else if (dataset == "projected") {
    return "#E08041";
  } else {
    return "FCDC4D";
  }
}

rateData.forEach(function(d) {
    d.yearString = d.year;
    d.year = parseYear(d.year);
    d.rateShort = Math.round(d.rate*100)/100;
});

var ratesNested = d3.nest()
  .key(function(d){ return d.group; })
  .entries(rateData);
  // .map(rateData, d3.map);

console.log(ratesNested);

// setting sizes of interactive
var margin = {
  top: 15,
  right: 100,
  bottom: 50,
  left: 100
};
if (screen.width > 768) {
  var width = 700 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
} else if (screen.width <= 768 && screen.width > 480) {
  var width = 650 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
} else if (screen.width <= 480 && screen.width > 340) {
  console.log("big phone");
  var margin = {
    top: 15,
    right: 45,
    bottom: 35,
    left: 30
  };
  var width = 340 - margin.left - margin.right;
  var height = 350 - margin.top - margin.bottom;
} else if (screen.width <= 340) {
  console.log("mini iphone")
  var margin = {
    top: 15,
    right: 55,
    bottom: 35,
    left: 30
  };
  var width = 310 - margin.left - margin.right;
  var height = 350 - margin.top - margin.bottom;
}

svg = d3.select("#line-chart").append('svg')
   .attr('width', width + margin.left + margin.right)
   .attr('height', height + margin.top + margin.bottom)
   .append("g")
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

x = d3.scaleTime().range([0, width]);
y = d3.scaleLinear().rangeRound([height, 0]);

// x-axis scale
x.domain(d3.extent([parseYear("1979"),parseYear("2023")]));//.nice();
y.domain([0, 30]);

// define the line
var valueline = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.rate); });

var voronoi = d3.voronoi()
    .x(function(d) {
      return x(d.year);
    })
    .y(function(d) {
      return y(d.rate);
    })
    .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

// Add the X Axis
if (screen.width <=480) {
 var yval = 40;
 svg.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x)
      .tickFormat(d3.timeFormat("%Y")))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)" );
} else {
 var yval = 50;
 svg.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x)
      .tickFormat(d3.timeFormat("%Y")))
}

 // Add the Y Axis
 svg.append("g")
     .call(d3.axisLeft(y))
     .append("text")
     .attr("class", "label")
     .attr("transform", "rotate(-90)")
     .attr("y", -70)
     .attr("x", -10)
     .attr("dy", "20px")
     .style("text-anchor", "end")
     .style("fill","black")
     .text("Contribution rates (%)");

svg.append("g")
    // .attr("class", "cities")
  .selectAll("path")
  .data(ratesNested)
  .enter().append("path")
    .attr("d", function(d) {
      // d.line = this;
      return valueline(d.values);
    });

var focus = svg.append("g")
    .attr("transform", "translate(-100,-100)")
    .attr("class", "focus");

if (screen.width >= 480) {
  focus.append("circle")
      .attr("r", 3.5);

  focus.append("rect")
      .attr("x",-110)
      .attr("y",-25)
      .attr("width","120px")
      .attr("height","20px")
      .attr("opacity","1")
      .attr("fill","white");

  focus.append("text")
      .attr("x", -100)
      .attr("y", -10);
}

var voronoiGroup = svg.append("g")
    .attr("class", "voronoi");

console.log(ratesNested);

// ratesNested.forEach(function(d) {
  // var class_list = "line voronoi id"+d.key;
  svg.append("path")
    .data(ratesNested)
    // .attr("class", class_list)
    // .attr("id","id"+d.key)
    // .style("stroke", color_by_dataset(d.key))//cscale(d.key))//
    .attr("d", function(d) { d.line = this; return valueline(d.values); });//valueline(d.values))
// });

console.log("voronoi data");
console.log(voronoi.polygons(d3.merge(ratesNested.map(function(d) { return d.values; }))));

voronoiGroup.selectAll(".voronoi")
  // .data(voronoi.polygons(ratesNested))
  .data(voronoi.polygons(d3.merge(ratesNested.map(function(d){
    console.log("this is d");
    console.log(d);
    console.log("this is d.values");
    console.log(d.values);
    return d.values;
  }))))
  .enter().append("path")
    .attr("d", function(d) {
      console.log(d);
      return d ? "M" + d.join("L") + "Z" : null;
    })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

// console.log(mouseover);
// console.log(mouseout);

// function mouseover(d) {
//   console.log("mouseover");
//   console.log(d);
//   // d3.select(d.data.city.line).classed("line-hover", true);
//   // d.data.city.line.parentNode.appendChild(d.data.city.line);
//   focus.attr("transform", "translate(" + x(d.data.year) + "," + y(d.data.value) + ")");
//   focus.select("text").text(d.data.data.value);
// }
//
// function mouseout(d) {
//   console.log("mouseout");
//   console.log(d);
//   // d3.select(d.data.city.line).classed("line-hover", false);
//   focus.attr("transform", "translate(-100,-100)");
// }

// var flatData = [];
// rateData.forEach(function(d,idx){
//   var datetemp = parseYear(d.year);
//   flatData.push(
//     {key: d.group, rate: d.rate, year: datetemp, yearString: d.year, rateShort: Math.round(d.rate*100)/100}
//   );
// });
//
// console.log(flatData);
// console.log(voronoiGroup);
// console.log(voronoi(flatData));

function mouseover(d) {
  console.log("mousing over");
  console.log(d);
  d3.select(".id"+d.data.key).classed("line-hover", true);
  focus.attr("transform", "translate(" + x(d.data.year) + "," + y(d.data.rate) + ")");
  focus.select("text").text(d.data.rateShort+"% in "+d.data.yearString);
}

function mouseout(d) {
  console.log(d);
  d3.select(".id"+d.data.key).classed("line-hover", false);
  focus.attr("transform", "translate(-100,-100)");
}

// voronoiGroup.selectAll("path")
//   .data(voronoi(flatData))
//   .enter().append("path")
//   .attr("d", function(d) {
//     console.log(d);
//     if (d) {
//       return "M" + d.join("L") + "Z";
//     }
//   })
//   .datum(function(d) {
//     if (d) {
//       console.log(d.point);
//       return d.point;
//     }
//   })
//   .on("mouseover", mouseover)
//   .on("mouseout", mouseout);
//
// ratesNested.forEach(function(d) {
//   var class_list = "line voronoi id"+d.key;
//   svg.append("path")
//     .attr("d", function(d) { d.line = this; return valueline(d.values); })
//     .attr("class", class_list)
//     .attr("id","id"+d.key)
//     .style("stroke", color_by_dataset(d.key))//cscale(d.key))//
//     // .attr("d", valueline(d.values))
//
// });
