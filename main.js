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

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("events.csv").then(data => {
    console.log(data); 
    console.log(typeof data[11])

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

    // 3.a: SET SCALES FOR CHART 1


    // 4.a: PLOT DATA FOR CHART 1


    // 5.a: ADD AXES FOR CHART 1


    // 6.a: ADD LABELS FOR CHART 1


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