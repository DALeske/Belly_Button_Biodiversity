function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/static/js/samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("/static/js/samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("/static/js/samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;
    var metadata = data.metadata;
    
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var resultArray = samples.filter(sampleObj => sampleObj.id == sample);

    //Gauge1 - Create a variable that filters the metadata array for the object with the desired sample number.
    var  metaArray = metadata.filter(sampleObj => sampleObj.id == sample);

    //  5. Create a variable that holds the first sample in the array.
    var result = resultArray[0];

    // Gauge 2. Create a variable that holds the first sample in the metadata array.
    var metaResult = metaArray[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var bb_otu_ids = result.otu_ids;
    var bb_otu_labels = result.otu_labels;
    var bb_sample_values = result.sample_values;

    // Guage 3. Create a variable that holds the washing frequency.
    var washFreq = metaResult.wfreq;

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    var yticks = bb_otu_ids.map(row=> "OTU" + row).slice(0,10).reverse();
    var xvals = bb_sample_values.slice(0,10).reverse();
    var labels = bb_otu_labels.slice(0,10).reverse();
    
    // 8. Create the trace for the bar chart. 
    var trace = {
      x: xvals,
      y: yticks,      
      type: "bar",
      orientation: "h",
      text: labels,
      hovertemplate: labels
    };

    var barData = [trace];

    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: {text: "<b>Top 10 Bacterial Cultures Found</b>", font:{size:24}},
      xaxis: {title: "Number of Bacteria"},
      yaxis: {title: "",
              text: labels}
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout)

   // BUBBLE CHART   
    // 1. Create the trace for the bubble chart.
    // bubsize = 2*Math.max(bb_sample_values)/(.2**2);
    var bubsize = .01;

    function getMaxofArray(numArray) {
      return Math.max.apply(null, numArray);
    }
    function getMinofArray(numArray) {
      return Math.min.apply(null, numArray);
    }
    var colormin = getMinofArray(bb_otu_ids);
    var colormax =getMaxofArray(bb_otu_ids);

    console.log(bb_otu_ids);
    console.log(colormin);
    console.log(colormax);

    var bubbleData = [{
      x: bb_otu_ids,
      y: bb_sample_values,
      mode:"markers",
      marker: {color: bb_otu_ids, 
        cmin: colormin,
        cmax: colormax,
        colorscale: "jet",
        size: bb_sample_values,
        sizeref: bubsize,
        sizemode: "area"},
      text: bb_otu_labels,
      hovertemplate: bb_otu_labels
      }   
    ];

    console.log(bubbleData);

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: {text:"<b>Bacteria Cultures per Sample</b>", font: {size:24}},
      xaxis: {title:"OTU ID"},
      showlegend: false,
      height: 600,
      width: 800   
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout); 
    
    // GUAGE CHART
        
    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      domain:{x:[0,1], y:[0,1]},
      value: washFreq,
      type: "indicator",
      mode:"gauge+number",
      title: {text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week", font:{size:24}},
      gauge: {
          axis: {range:[null,10]},
          bar: {color:"black"},
          steps:[
              {range: [0,2], color: "red"},
              {range: [2,4], color: "orange"},
              {range: [4,6], color: "yellow"},
              {range: [6,8], color: "lime"},
              {range: [8,10], color: "green"}
          ]
      }
    }
     
    ];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      width:600,
      height:500,
      margin:{t:0,b:0}
     };
    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge",gaugeData, gaugeLayout);

  });
}
