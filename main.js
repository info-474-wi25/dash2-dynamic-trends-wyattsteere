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

// const svg2_RENAME = d3.select("#lineChart2")
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("events.csv").then(data => {
    //console.log(data); 
    //console.log(typeof data[11])
    // data.forEach(d => {
    //     console.log(d["ev_year"]);       // Convert year to a number
    //        // Rename column for clarity
    // });

    
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
        ev_year,
        ...values
    }));
    
    yearlyData.sort((a, b) => a.ev_year - b.ev_year);

    console.log(yearlyData)

    // 2.b: ... AND TRANSFORM DATA

    //flattening the data 
    const flattenedData = yearlyData.flatMap(d => [
        { year: d.ev_year, total: d.inj_total_f, category: 'inj_total_f' },
        { year: d.ev_year, total: d.inj_total_m, category: 'inj_total_m' },
        { year: d.ev_year, total: d.inj_total_s, category: 'inj_total_s' }
      ]);

      console.log(flattenedData); 

    

    // 3.a: SET SCALES FOR CHART 1
    // Set scales
    const x = d3.scalePoint()
    .domain(flattenedData.map(d => d.year))
    .range([0, width])
    .padding(0.5);

    const y = d3.scaleLinear()
    .domain([0, d3.max(flattenedData, d => d.total)])
    .range([height, 0]);

    const color = d3.scaleOrdinal()
    .domain(["inj_total_f", "inj_total_m", "inj_total_s"])
    .range(d3.schemeCategory10);


    // 4.a: PLOT DATA FOR CHART 1
    // Line generator
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.total));

    // Plot the lines
    svgLine.selectAll(".line")
        .data(d3.groups(flattenedData, d => d.category))
        .enter().append("path")
        .attr("class", "line")
        .attr("d", d => line(d[1]))
        .style("stroke", d => color(d[0]))
        .style("fill", "none")
        .style("stroke-width", 2);

    // 5.a: ADD AXES FOR CHART 1
    // Add x-axis
    svgLine.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Add y-axis
    svgLine.append("g")
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
    

    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // 3.b: SET SCALES FOR CHART 2


    // 4.b: PLOT DATA FOR CHART 2


    // 5.b: ADD AXES FOR CHART 


    // 6.b: ADD LABELS FOR CHART 2


    // 7.b: ADD INTERACTIVITY FOR CHART 2


});