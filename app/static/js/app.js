/*
gather sample names and place in dropdown
*/
// api endpoint for sample names
var sampleNamesUrl = '/names'

Plotly.d3.json(sampleNamesUrl, function(error, sampleNames) {
    if (error) {
        return console.warn(error);
    };

    sampleNames.forEach( function(name) {
        Plotly.d3
        .select('#selDataset')
        .append('option')
        .attr('value', name)
        .attr('class', 'dropDownItem')
        .text(name)
    });
});

/*
function to capture changes to dropdown selection
*/
function optionChanged(sample) {
    // if sample is blank default to sample BB_940
    sample = (sample === '' ? 'BB_940': sample)

    // url definitions
    var sampleURL = `/sample/${sample}`;
    var otuURL = '/otu';
    var metadataURL = `/metadata/${sample}`;
    var wfreqURL = `/wfreq/${sample}`;

    // api call to sample endpoint
    Plotly.d3.json(sampleURL, function(error, sampleResponse) {
        if (error) {
                console.warn(error);
            };
            
        var allVals = sampleResponse.sample_values;
        var allIDs = sampleResponse.otu_ids
        
        var pieValues = allVals.slice(0,10);
        var pieLabels = allIDs.slice(0,10);
        
        // api call to otu endpoint
        Plotly.d3.json(otuURL, function(error, otuResponse) {
            if (error) {
                console.warn(error);
            }
    
            var allDescriptions = [];
            allIDs.forEach( function(data) {
                allDescriptions.push(otuResponse[data]);
            })

            var pieDescriptions = allDescriptions.slice(0,10);
            
            Plotly.d3.json(metadataURL, function(error, metaResponse) {
                if (error) {    
                    console.warn(error)
                }

                var age, bbType, ethnicity, gender, location, sampleID;

                age = metaResponse.AGE;
                bbType = metaResponse.BBTYPE;
                ethnicity = metaResponse.ETHNICITY;
                gender = metaResponse.GENDER;
                location = metaResponse.LOCATION;
                sampleID = metaResponse.SAMPLEID;

                Plotly.d3.json(wfreqURL, function(error, wfreqResponse){
                    if (error) {
                        console.warn(error)
                    }                      

                    var meterLevel = wfreqResponse;
                    // if plot doesn't exist create new plot
                    if (document.getElementsByClassName('js-plotly-plot').length === 0) { 
                        var pieData = [{
                            values: pieValues,
                            labels: pieLabels,
                            type: 'pie',
                            hovertext: pieDescriptions,
                            
                        }];
                            
                        var bubbleData = [{
                            x: allIDs,
                            y: allVals,
                            mode: 'markers',
                            text: allDescriptions,
                            marker: {
                                color: allIDs,
                                size: allVals
                            },
                        }];

                        Plotly.newPlot('pie', pieData);
                        Plotly.newPlot('bubble', bubbleData);

                        Plotly.d3.select('#metadata').append('li').attr('id', 'age').text(`AGE: ${age}`)
                        Plotly.d3.select('#metadata').append('li').attr('id', 'bbType').text(`BBTYPE: ${bbType}`)
                        Plotly.d3.select('#metadata').append('li').attr('id', 'ethnicity').text(`ETHNICITY: ${ethnicity}`)
                        Plotly.d3.select('#metadata').append('li').attr('id', 'gender').text(`GENDER: ${gender}`)
                        Plotly.d3.select('#metadata').append('li').attr('id', 'location').text(`LOCATION: ${location}`)
                        Plotly.d3.select('#metadata').append('li').attr('id', 'sampleID').text(`SAMPLEID: ${sampleID}`)
                        
                        gauge(meterLevel)

                    } else {
                        // if plots exist restyle plots
                        // restyle pie plot
                        var $piePlot = document.getElementById('pie')
                        Plotly.restyle($piePlot, 'values', [pieValues]);
                        Plotly.restyle($piePlot, 'labels', [pieLabels]);
                        Plotly.restyle($piePlot, 'hovertext', [pieDescriptions]);

                        // restyle bubble plot
                        var $bubblePlot = document.getElementById('bubble')
                        var markerProps = {
                            color: allIDs,
                            size: allVals
                        };
                        Plotly.restyle($bubblePlot, 'x', [allIDs]);
                        Plotly.restyle($bubblePlot, 'y', [allVals]);
                        Plotly.restyle($bubblePlot, 'marker', [markerProps]);

                        // update sample metadata
                        Plotly.d3.select('#age').text(`AGE: ${age}`)
                        Plotly.d3.select('#bbType').text(`BBTYPE: ${bbType}`)
                        Plotly.d3.select('#ethnicity').text(`ETHNICITY: ${ethnicity}`)
                        Plotly.d3.select('#gender').text(`GENDER: ${gender}`)
                        Plotly.d3.select('#location').text(`LOCATION: ${location}`)
                        Plotly.d3.select('#sampleID').text(`SAMPLEID: ${sampleID}`)
                        
                        // update washing frequency gauge
                        var $freqGauge = document.getElementById('gauge')
                        // Trig to calc meter point
                        var degrees = 180 - (meterLevel * 20),
                            radius = .5;
                        var radians = degrees * Math.PI / 180;
                        var x = radius * Math.cos(radians);
                        var y = radius * Math.sin(radians);
                        
                        // Path: may have to change to create a better triangle
                        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
                            pathX = String(x),
                            space = ' ',
                            pathY = String(y),
                            pathEnd = ' Z';
                        var path = mainPath.concat(pathX,space,pathY,pathEnd);
                        
                        var data_update = {
                            text: wfreqResponse
                        };
                        
                        var layout_update = {
                            shapes:[{
                                type: 'path',
                                path: path,
                                fillcolor: '850000',
                                line: {
                                    color: '850000'
                                }
                            }]
                        };
                        
                        Plotly.restyle($freqGauge, data_update, [0])
                        Plotly.relayout($freqGauge, layout_update)
                    };
                });
            });
        });
    });
};


function gauge(level){
    // convert wash frequency 
    meterLevel = level * 20;

    // Trig to calc meter point
    var degrees = 180 - meterLevel,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    
    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);
    
    var data = [
        { 
            type: 'scatter',
            x: [0], 
            y:[0],
            marker: {size: 28, color:'850000'},
            showlegend: false,
            name: 'scrubs',
            text: level,
            hoverinfo: 'text+name'
        },
        { 
            values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
            rotation: 90,
            text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
            textinfo: 'text',
            textposition:'inside',
            marker: {
                colors:[ 'rgba(14, 127, 0, .5)',
                            'rgba(14, 127, 0, .5)', 'rgba(14, 127, 0, .5)',
                            'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                            'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                            'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                            'rgba(255, 255, 255, 0)']
                    },
            labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
            hoverinfo: 'label',
            hole: .5,
            type: 'pie',
            showlegend: false
        }
    ];

    var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
        }],
        title: 'Belly Button Washing Frequency',
        xaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]}
    };
    Plotly.newPlot('gauge', data, layout);  
};

optionChanged("");