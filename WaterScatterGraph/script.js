
// Load the data
d3.json('final_cleaned_water_data.json').then(function(data) {
    // Flatten the data structure and parse dates
    const flattenedData = data.reduce((acc, d) => {
        const date = d3.isoParse(d.date);
        d.records.forEach(record => {
            acc.push({date, ...record});
        });
        return acc;
    }, []);


    // Extract unique locName values
const uniqueLocations = [...new Set(flattenedData.map(item => item.locName))];

// Populate the location-select dropdown
const locationSelect = d3.select("#location-select");
uniqueLocations.forEach(loc => {
    locationSelect.append("option").text(loc).attr("value", loc);
});



     
    function createGraph(parameter, location) {
    // Filter data for the specific parameter and location
    const parameterData = flattenedData.filter(d => d[parameter] != null && d.locName === location);

    // Set dimensions and margins for the graph
    const margin = {top: 10, right: 20, bottom: 50, left: 60},
          width = 900 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Append the SVG object to a div
    const svg = d3.select("#my_dataviz")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    const x = d3.scaleTime()
                .domain(d3.extent(parameterData, function(d) { return d.date; }))
                .range([0, width]);
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));

    // Label for the x axis
    svg.append("text")             
       .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
       .style("text-anchor", "middle")
       .text("Date");

    // Add Y axis
    const y = d3.scaleLinear()
                .domain([0, d3.max(parameterData, function(d) { return +d[parameter]; })])
                .range([height, 0]);
    svg.append("g")
       .call(d3.axisLeft(y));

    // Label for the y axis
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin.left)
       .attr("x",0 - (height / 2))
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text(parameter);

    // Define the line
    const line = d3.line()
                   .defined(d => d[parameter] != null) // Handles missing/null values
                   .x(function(d) { return x(d.date); })
                   .y(function(d) { return y(d[parameter]); });

    // Add the line
    svg.append("path")
       .datum(parameterData)
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 1.5)
       .attr("d", line);

    // Remove existing tooltip if any
    d3.select(".tooltip").remove();

    // Create a new tooltip
    const tooltip = d3.select("body").append("div") 
                     .attr("class", "tooltip")       
                     .style("opacity", 0);

    



       // Add circles to each data point
svg.selectAll(".dot")
   .data(parameterData)
   .enter().append("circle")
   .attr("class", "dot")
   .attr("cx", function(d) { return x(d.date); })
   .attr("cy", function(d) { return y(d[parameter]); })
   .attr("r", 5)
   .on("mouseover", function(event, d) {
       tooltip.transition()
              .duration(200)
              .style("opacity", .9);
       tooltip.html(`sampleMedia: ${d.sampleMedia}<br/>` +
                `visitDate: ${d.visitDate}<br/>` +
                `dateAnalTPTN: ${d.dateAnalTPTN}<br/>` +
                `TN: ${d.TN}<br/>` +
                `TP: ${d.TP}<br/>` +
                `dateAnalDiss: ${d.dateAnalDiss}<br/>` +
                `disNH4: ${d.disNH4}<br/>` +
                `disNO3: ${d.disNO3}<br/>` +
                `disPO4: ${d.disPO4}<br/>` +
                `dateAnalTDPTDN: ${d.dateAnalTDPTDN}<br/>` +
                `TDN: ${d.TDN}<br/>` +
                `TDP: ${d.TDP}<br/>` +
                `locName: ${d.locName}<br/>` +
                `Pool Volume (cu ft): ${d['Pool Volume (cu ft)']}<br/>` +
                `specific_location: ${d.specific_location}<br/>` +
                `samp_type: ${d.samp_type}<br/>` +
                `notes: ${d.notes}<br/>` +
                `samp_notes: ${d.samp_notes}`)
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
   })
   .on("mouseout", function(d) {
       tooltip.transition()
              .duration(500)
              .style("opacity", 0);
   })
   .on("click", function(event, d) {
       // Display the tooltip
       tooltip.transition()
              .duration(200)
              .style("opacity", .9);
       tooltip.html(`sampleMedia: ${d.sampleMedia}<br/>` +
                `visitDate: ${d.visitDate}<br/>` +
                `dateAnalTPTN: ${d.dateAnalTPTN}<br/>` +
                `TN: ${d.TN}<br/>` +
                `TP: ${d.TP}<br/>` +
                `dateAnalDiss: ${d.dateAnalDiss}<br/>` +
                `disNH4: ${d.disNH4}<br/>` +
                `disNO3: ${d.disNO3}<br/>` +
                `disPO4: ${d.disPO4}<br/>` +
                `dateAnalTDPTDN: ${d.dateAnalTDPTDN}<br/>` +
                `TDN: ${d.TDN}<br/>` +
                `TDP: ${d.TDP}<br/>` +
                `locName: ${d.locName}<br/>` +
                `Pool Volume (cu ft): ${d['Pool Volume (cu ft)']}<br/>` +
                `specific_location: ${d.specific_location}<br/>` +
                `samp_type: ${d.samp_type}<br/>` +
                `notes: ${d.notes}<br/>` +
                `samp_notes: ${d.samp_notes}`)
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");

       // Remove existing line and text if any
       svg.selectAll(".verticalLine, .dataLabel").remove();

       // Draw a dotted vertical line
       svg.append("line")
          .attr("class", "verticalLine")
          .attr("x1", x(d.date))
          .attr("y1", y(d[parameter]))
          .attr("x2", x(d.date))
          .attr("y2", height)
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "5,5");

       // Append text label for the data point value
       svg.append("text")
          .attr("class", "dataLabel")
          .attr("x", x(d.date))
          .attr("y", y(d[parameter]) - 10) // Position slightly above the data point
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .text(d[parameter]);
   });



    }
     
    // Event listener for parameter dropdown
d3.select("#parameter-select").on("change", function() {
    const selectedParameter = this.value;
    const selectedLocation = d3.select("#location-select").node().value;
    // Clear existing graph
    d3.select("#my_dataviz").html("");
    // Create a new graph
    createGraph(selectedParameter, selectedLocation);
});

// Event listener for location dropdown
d3.select("#location-select").on("change", function() {
    const selectedLocation = this.value;
    const selectedParameter = d3.select("#parameter-select").node().value;
    // Clear existing graph
    d3.select("#my_dataviz").html("");
    // Create a new graph
    createGraph(selectedParameter, selectedLocation);
});

    // Initial graph creation with the first location as default
createGraph('TN', uniqueLocations[0]);


    
});
