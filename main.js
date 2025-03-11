// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svgLine = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

//Tooltip 
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ddd")
    .style("border-radius", "3px")
    .style("padding", "8px")
    .style("pointer-events", "none");

// 2.a: LOAD...
d3.csv("events.csv").then(data => {
    
    const groupedByYear = d3.rollup(
        data.filter(d => d.ev_year >= 1982),
        v => ({
        inj_total_f: d3.sum(v, d => d.inj_tot_f),
        inj_total_m: d3.sum(v, d => d.inj_tot_m),
        inj_total_s: d3.sum(v, d => d.inj_tot_s)
        }),
        
        d => d.ev_year
    );

    const yearlyData = Array.from(groupedByYear, ([ev_year, values]) => ({
        ev_year: +ev_year,
        ...values
    }));
    
    yearlyData.sort((a, b) => a.ev_year - b.ev_year);

    //years var
    const minYear = d3.min(yearlyData, d => d.ev_year);
    const maxYear = d3.max(yearlyData, d => d.ev_year);
    
    let filteredYearlyData = [...yearlyData];

    // 2.b: ... AND TRANSFORM DATA
    function updateFlattenedData() {
        return filteredYearlyData.flatMap(d => [
            { year: d.ev_year, total: d.inj_total_f, category: 'Fatal Injuries' },
            { year: d.ev_year, total: d.inj_total_m, category: 'Major Injuries' },
            { year: d.ev_year, total: d.inj_total_s, category: 'Minor Injuries' }
        ]);
    }
    
    let flattenedData = updateFlattenedData();

    // 3.a: SET SCALES FOR CHART 1
    // Set scales
    const x = d3.scalePoint()
        .domain(yearlyData.map(d => d.ev_year))
        .range([0, width])
        .padding(0.5);

    const y = d3.scaleLinear()
        .domain([0, d3.max(flattenedData, d => d.total)])
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(["Fatal Injuries", "Major Injuries", "Minor Injuries"])
        .range(["#e41a1c", "#377eb8", "#4daf4a"]);

    // 4.a: PLOT DATA FOR CHART 1
    // Line generator
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.total));

    // Create a group for the lines that will be updated
    const linesGroup = svgLine.append("g")
        .attr("class", "lines-group");
    
    // Function to draw and update lines
    function updateChart() {
        // Remove existing lines
        linesGroup.selectAll(".line").remove();
        
        // Update flattened data based on current filter
        flattenedData = updateFlattenedData();
        
        // Update x domain with filtered years
        x.domain(filteredYearlyData.map(d => d.ev_year));
        
        // Update y domain based on filtered data
        y.domain([0, d3.max(flattenedData, d => d.total)]);
        
        // Draw lines with updated data
        linesGroup.selectAll(".line")
            .data(d3.groups(flattenedData, d => d.category))
            .enter().append("path")
            .attr("class", "line")
            .attr("d", d => line(d[1]))
            .style("stroke", d => color(d[0]))
            .style("fill", "none")
            .style("stroke-width", 2)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("stroke-width", 4);
                    
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                    
                tooltip.html(`<strong>${d[0]}</strong>`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .style("stroke-width", 2);
                    
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
            
        // Update x-axis
        svgLine.select(".x-axis")
            .transition()
            .duration(500)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");
            
        // Update y-axis
        svgLine.select(".y-axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y));
            
        // Legend should work now
        if (svgLine.select(".legend").empty()) {
            const legend = svgLine.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - 150}, 0)`);
                
            const categories = ["Fatal Injuries", "Major Injuries", "Minor Injuries"];
            
            categories.forEach((category, i) => {
                const legendRow = legend.append("g")
                    .attr("transform", `translate(0, ${i * 20})`);
                    
                legendRow.append("rect")
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr("fill", color(category));
                    
                legendRow.append("text")
                    .attr("x", 20)
                    .attr("y", 12.5)
                    .style("font-size", "12px")
                    .text(category);
            });
        }
    }

    // 5.a: ADD AXES FOR CHART 1
    // Add x-axis
    svgLine.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Add y-axis
    svgLine.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    // 6.a: ADD LABELS FOR CHART 1
    // Add x-axis label
    svgLine.append("text")
        .attr("transform", `translate(${width / 2},${height + margin.top + 10})`)
        .style("text-anchor", "middle")
        .text("Year");

    // Add y-axis label
    svgLine.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Total Injuries");

    // Add chart title
    svgLine.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Injury type by Year");

    // 7.a: ADD INTERACTIVITY FOR CHART 1
    const sliderContainer = d3.select("#year-range");
    
    sliderContainer.html("");
    
    const sliderDiv = sliderContainer.append("div")
        .style("width", "400px")
        .style("margin", "0 auto");
    
    const sliderSvg = sliderDiv.append("svg")
        .attr("width", 500)
        .attr("height", 75);
    
    const sliderG = sliderSvg.append("g")
        .attr("transform", "translate(30,20)");
    
    const sliderScale = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([0, 340])
        .clamp(true);
    
    const slider = d3.sliderBottom(sliderScale)
        .min(minYear)
        .max(maxYear)
        .width(400)

        .tickFormat(d3.format("d"))
        .ticks(Math.min(maxYear - minYear + 1, 10))
        .tickPadding(10)
        .default([minYear, maxYear])
        .fill("#69b3a2")
        .on("onchange", val => {
            d3.select("#slider-range-value").text(`${Math.round(val[0])} - ${Math.round(val[1])}`);
            filteredYearlyData = yearlyData.filter(d => 
                d.ev_year >= Math.round(val[0]) && d.ev_year <= Math.round(val[1])
            );
            
            
            updateChart();
        });
    
    
    sliderG.call(slider);
    
    d3.select("#slider-range-value").text(`${minYear} - ${maxYear}`);

    updateChart();
});