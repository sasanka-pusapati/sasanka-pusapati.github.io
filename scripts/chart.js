var currentScene = 1;
const vizobject = {
    color_category: d3.schemeCategory20,
    CountryColorMap: new Map(),
    RegionColorMap: new Map(),
    graph: null,
    countryMap: new Map(),
    regionMap: new Map(),
    countryContinent: new Map()
}

const rowConverter = function (d) {
    return {
        //Make a new Date object for each year + month
        Year: parseInt(d.year),
        //Convert from string to float
        Country: d.country,
        Country_Code: d.country_code,
        Mortality: parseFloat(d.infant_mortality_rate),
        Region: d.isRegion
    };
}

const countryMapConverter = function (d) {
    return {
        country_name: d.Country,
        continent_name: d.Continent
    };
}

function generateCheckBoxes(countries, screen_id) {
    var countryTuples = [];
    var data, colorMap;
    if (screen_id == 2) {
        data = vizobject.regionMap
        colorMap = vizobject.RegionColorMap
    }
    if (screen_id == 3) {
        data = vizobject.countryMap
        colorMap = vizobject.CountryColorMap
    }
    for (i in countries) {
        //console.log(countries[i])
        let code = data.get(countries[i])[0].Country_Code;
        let name = data.get(countries[i])[0].Country;
        let color = colorMap.get(code);
        let tuple = [name, code, color];

        countryTuples.push(tuple);
    }
    countryTuples.sort();
    const input_type_checkbox_part1 = '<input type="checkbox" id=chk_"';
    const input_type_checkbox_part2 = '" name="';
    const input_type_checkbox_part3 = '" value=';
    const input_type_checkbox_part4 = ' onclick="handleCheckBoxEvent(this, ' + screen_id + ')"';

    const closing_bracket = '>';

    const input_type_label_part1 = '<label for=chk_"';
    const input_type_label_part2 = '">';
    const input_type_label_part3 = '</label><br>';

    let colorpalette = '<svg width="12" height="12">\n' +
        '  <rect width="12" height="12" style="fill:color_code_placeholder;stroke-width:3;stroke:color_code_placeholder"/>\n' +
        '</svg>';
    var finalResult = '';
    for (i in countryTuples) {
        let newcolorpalette = colorpalette.replaceAll('color_code_placeholder', countryTuples[i][2]);
        //console.log(countryTuples[i][0]);
        let temp = newcolorpalette + input_type_checkbox_part1
            + countryTuples[i][1]
            + input_type_checkbox_part2
            + countryTuples[i][1]
            + input_type_checkbox_part3
            + countryTuples[i][0]
            + input_type_checkbox_part4
            + closing_bracket
            + input_type_label_part1
            + countryTuples[i][1]
            + input_type_label_part2
            + countryTuples[i][0]
            + input_type_label_part3
        //console.log(temp);
        finalResult = finalResult + temp;

    }
    var container;
    if (screen_id == 2) {
        container = document.getElementById('filter_container_region');
        //console.log(container);
    } else if (screen_id == 3) {
        container = document.getElementById('filter_container');
    }
    container.innerHTML = finalResult;
}

function onbodyload() {
    const params = new URLSearchParams(window.location.search);
    const scene_param = params.get('scene');
    var scene1 = document.getElementById("scene1")
    var scene2 = document.getElementById("scene2")
    var scene3 = document.getElementById("scene3")

    if (scene_param == null || scene_param == 1) {
        scene1.style.background = "forestgreen"
        scene2.style.background = "lightgrey"
        scene3.style.background = "lightgrey"
        scene2.style.color = "black"
        scene3.style.color = "black"

        currentScene = 1;
    } else if (scene_param == 2) {
        scene2.style.background = "forestgreen"
        scene1.style.background = "lightgrey"
        scene3.style.background = "lightgrey"
        scene1.style.color = "black"
        scene3.style.color = "black"
        currentScene = 2;
    } else if (scene_param == 3) {
        scene3.style.background = "forestgreen"
        scene1.style.background = "lightgrey"
        scene2.style.background = "lightgrey"
        scene2.style.color = "black"
        scene1.style.color = "black"
        currentScene = 3;
    }

    if (parseInt(scene_param) == 3) {
        document.getElementById("filter_country").style.display = "inline";
    }
    // Disabling the filter by region
    /*if (parseInt(scene_param) == 2) {
        document.getElementById("filter_region").style.display = "inline";
    }*/

    let scene_name = ('Scene ') + (scene_param == null ? '1' : scene_param);
    let dataset2 = d3.csv("./data/Country_Continent.csv", countryMapConverter, function (data) {
        for (const i in data) {
            vizobject.countryContinent.set(data[i].country_name, data[i].continent_name);
        }
    })
    let dataset = d3.csv("./data/WDI_IMR.csv", rowConverter, function (data) {
        const countries = d3.map(data, function (d) {
            if (d.Region == "")
                return (d.Country_Code)
            else
                return null
        }).keys().filter(function (v) {
            return v != "null"
        });

        const region = d3.map(data, function (d) {
            if (d.Region == "yes")
                return (d.Country_Code)
            else
                return null
        }).keys().filter(function (v) {
            return v != "null"
        });

        for (const i in countries) {
            vizobject.CountryColorMap.set(countries[i], vizobject.color_category[i % 20]);
        }
        for (const i in region) {
            vizobject.RegionColorMap.set(region[i], vizobject.color_category[i % 20]);
        }
        for (const i in data) {
            if (data[i].Region == "") {
                if (!(data[i].Country_Code == undefined)) {
                    if (parseInt(data[i].Year) >= 1990) {
                        let values = vizobject.countryMap.get(data[i].Country_Code);
                        if (values == null) {
                            values = [];
                        }
                        values.push(data[i]);
                        vizobject.countryMap.set(data[i].Country_Code, values);
                    }
                }

            } else {
                if (!(data[i].Country_Code == undefined)) {
                    if (parseInt(data[i].Year) >= 1990) {
                        let values = vizobject.regionMap.get(data[i].Country_Code);
                        if (values == null) {
                            values = [];
                        }
                        values.push(data[i]);
                        vizobject.regionMap.set(data[i].Country_Code, values);
                    }
                }
            }

        }
        if (parseInt(scene_param) == 2) {
            generateCheckBoxes(region, 2);
            vizobject.countryList = region;
        }
        if (parseInt(scene_param) == 3) {
            generateCheckBoxes(countries, 3);
            vizobject.countryList = countries;
        }
        //vizobject.countryList = countries;

        let graph = {};
        graph.xAxis_Length = 2020;
        graph.xAxis_Origin = 1990;
        graph.yAxis_Length = 200;
        graph.yAxis_Origin = 0;
        vizobject.graph = graph;

        let scene_param_value = scene_param == null ? 1 : parseInt(scene_param);
        drawGraph(scene_param_value);
        if (scene_param_value == 1) {
            drawLineChartForEntity('WLD', vizobject.CountryColorMap, vizobject.countryMap);
        }
        if (scene_param_value == 2) {

            drawLineChartForEntity('AFE', vizobject.RegionColorMap, vizobject.regionMap);
            drawLineChartForEntity('AFW', vizobject.RegionColorMap, vizobject.regionMap);
            drawLineChartForEntity('EUU', vizobject.RegionColorMap, vizobject.regionMap);
            drawLineChartForEntity('NAC', vizobject.RegionColorMap, vizobject.regionMap);
            drawLineChartForEntity('SSF', vizobject.RegionColorMap, vizobject.regionMap);
            drawLineChartForEntity('LIC', vizobject.RegionColorMap, vizobject.regionMap);
            drawLineChartForEntity('MIC', vizobject.RegionColorMap, vizobject.regionMap);
            drawLineChartForEntity('HIC', vizobject.RegionColorMap, vizobject.regionMap);

            checkbox = document.getElementById('chk_' + '"AFE"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"AFW"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"EUU"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"NAC"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"SSF"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"LIC"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"MIC"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"HIC"');
            checkbox.checked = true;
        }
        if (scene_param_value == 3) {
            document.getElementById("caption_box").innerHTML = caption_box_html_scene_3_clear;

            drawLineChartForEntity('LBR', vizobject.CountryColorMap, vizobject.countryMap);
            drawLineChartForEntity('CAF', vizobject.CountryColorMap, vizobject.countryMap);
            drawLineChartForEntity('SLE', vizobject.CountryColorMap, vizobject.countryMap);
            drawLineChartForEntity('SOM', vizobject.CountryColorMap, vizobject.countryMap);
            drawLineChartForEntity('IND', vizobject.CountryColorMap, vizobject.countryMap);
            drawLineChartForEntity('USA', vizobject.CountryColorMap, vizobject.countryMap);
            drawLineChartForEntity('GBR', vizobject.CountryColorMap, vizobject.countryMap);
            drawLineChartForEntity('BWA', vizobject.CountryColorMap, vizobject.countryMap);

            checkbox = document.getElementById('chk_' + '"CAF"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"LBR"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"SLE"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"SOM"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"IND"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"USA"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"GBR"');
            checkbox.checked = true;
            checkbox = document.getElementById('chk_' + '"BWA"');
            checkbox.checked = true;

        }

        addcaption(scene_param_value);
        addannotations(scene_param_value);
        addFooter(scene_param_value);
    })

}


function drawGraph(scene) {
    var margin = 200;

    var svg = d3.select("svg");
    width = svg.attr("width") - margin, //300
        height = svg.attr("height") - margin //200


    vizobject.graph.xScale = d3.scaleLinear().domain([vizobject.graph.xAxis_Origin, vizobject.graph.xAxis_Length]).range([0, width]);
    vizobject.graph.yScale = d3.scaleLinear().domain([vizobject.graph.yAxis_Origin, vizobject.graph.yAxis_Length]).range([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + 100 + "," + 100 + ")");

    if (scene == 1) {
        svg.append('text')
            .attr('x', width / 2 + 100)
            .attr('y', 90)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 20)
            .text('Infant Mortality Rate (Worldwide)');
    } else if (scene == 2) {
        svg.append('text')
            .attr('x', width / 2 + 100)
            .attr('y', 90)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 20)
            .text('Comparison of Infant Mortality Rate across Regions and Groups');
    } else if (scene == 3) {
        svg.append('text')
            .attr('x', width / 2 + 100)
            .attr('y', 90)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 20)
            .text('Comparison of Infant Mortality Rate by Countries');
    }


    svg.append('text')
        .attr('x', width / 2 + 100)
        .attr('y', height - 15 + 170)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 14)
        .text('Year [1990 - 2020]');


    svg.append('text')
        .attr('text-anchor', 'right')
        .attr('transform', 'translate(60,' + height + ')rotate(-90)')
        .style('font-family', 'Helvetica')
        .style('font-size', 14)
        .text('Infant Mortality Rate (per 1000 live births)');


    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(vizobject.graph.xScale).tickFormat(d3.format("d")));

    g.append("g")
        .call(d3.axisLeft(vizobject.graph.yScale).tickFormat(d3.format("d")));

}

function handleCheckBoxEvent(country, screen_id) {
    //alert(countrycode);
    let checkbox = document.getElementById(country.id);
    if (checkbox.checked) {
        if (screen_id == 2)
            drawLineChartForEntity(country.id.substring(5, country.id.length - 1), vizobject.RegionColorMap, vizobject.regionMap);
        if (screen_id == 3)
            drawLineChartForEntity(country.id.substring(5, country.id.length - 1), vizobject.CountryColorMap, vizobject.countryMap);
    } else {
        removeLineChartForEntity(country.id.substring(5, country.id.length - 1));
    }
    //console.log(country.id);
}

const caption_box_html_1 = '</br></br><li>Infant mortality rate (IMR) is the number of deaths per 1,000 live births of children under one year of age.</li>' +
    '            </br>\n' +
    '            <li> Infant Mortality Rate is steadily declining across the world.</li>' +
    '            </br>\n' +
    '            <li>\n' +
    '                The Average drop per year is approximately around 1.25.\n' +
    '            </li>\n' +
    '            </br>\n' +
    '            <li>\n' +
    '                Average drop per year is calculated as (Rate in 1990 - Rate in 2020) / 30\n' +
    '            </li>';
const caption_box_html_2 = /*'</br> Explore the trends for various groups by selecting in the filter box.<br>' +
    '<br> Current Selection shows :'+*/
    '</br></br><li> There is a <b><em>decline</em></b> in Infant Moratliy Rate(IMR) worldwide mainly <em>after</em> 2000.' +
    '</br></br><li> For some countries in <b>African</b> continent, IMR is still high.' +
    '</br></br><li> The IMR of <b>African</b> countries in 2020 is still high even when compared with 1990 year data of regions like <b>North America</b> and <b>European Union</b> ' +
    '</br></br><li> The IMR of <b>low income group</b> countries is <b>higher</b> than <b>middle</b> or <b>high income groups</b>.';
const caption_box_html_scene_3_clear = '</br></br><li> Explore the trends for various countries by selecting in the filter box';
const caption_box_html_scene_2_clear = '</br></br><li> Explore the trends for various groups by selecting in the filter box';
const caption_box_html_3 = '<br> Explore the trends for various countries by selecting in the filter box.</br>' +
    '<br> Current Selection shows :' +
    '</br></br><li> Many of the countries has <u><b>reduced</b></u> the IMR in last 30 years. ' +
    '</br></br><li> Countries in <b>Africa</b> continent still has high IMR. ' +
    '</br></br><li> Countries in <b>Europe</b> and <b>North America</b> in general has very low IMR. ' +
    '</br></br><li> Developing countries like <b>India</b> show constant declining trend of IMR over the period. ' +
    '</br></br><li> Not much improvement on the IMR value for two African countries like <b>Botswana</b> & <b>Somalia</b>.';

function addcaption(sceneid) {
    if (sceneid == 1) {
        document.getElementById("caption_box").innerHTML = caption_box_html_1;
    } else if (sceneid == 2) {
        document.getElementById("caption_box").innerHTML = caption_box_html_2;
    } else if (sceneid == 3) {
        document.getElementById("caption_box").innerHTML = caption_box_html_3;
    }

}

var footer_box_html_1 = '<p style="font-family: Helvetica font-size: 15px font-style: italic">Move the mouse over each data point to show tooltip with details.';
var footer_box_html_2;
var footer_box_html_3 = '<b>Data Source: @ <a href="https://data.worldbank.org/indicator/SP.DYN.IMRT.IN" target="_blank">World Data Indicators(WDI)</a></b>' +
    footer_box_html_1;

function addFooter(sceneid) {
    document.getElementById("footer_box").innerHTML = footer_box_html_1;
    document.getElementById("footer_box").innerHTML = footer_box_html_3;
}

function addAnnotationText(group, xValue, yValue, text) {
    group.append("text")
        .attr("x", xValue)
        .attr("y", yValue)
        .attr("class", "annotationText")
        .style('font', '15px Helvetica')
        .text(text);
}

function addAnnotationBullet(group, xValue, yValue) {
    group.append('circle')
        .attr('cx', xValue)
        .attr('cy', yValue)
        .attr('r', '3px')
        .style('fill', 'black');
}

function addAnnotationIndicator(group, xValue, yValue, size, color) {
    group.append('circle')
        .attr('cx', xValue)
        .attr('cy', yValue)
        .attr('r', size)
        .style('fill', color);
}

function addLine(group, startX, startY, endX, endY) {
    group
        .append("line")
        .attr("opacity", 1)
        .attr("style", "stroke:rgb(0,0,0);stroke-width:1.5px")
        .attr("x1", startX)
        .attr("y1", startY)
        .attr("x2", endX)
        .attr("y2", endY)

}

function addannotations(sceneid) {
    var group = d3.select("#svg_viz")
        .select("svg")
        .append("g");

    if (sceneid == 1) {
        addLine(group, vizobject.graph.xScale(2014) + 100, vizobject.graph.yScale(32.3) + 100, vizobject.graph.xScale(2014) + 100, vizobject.graph.yScale(32.3) + 40)
        addAnnotationIndicator(group, vizobject.graph.xScale(2014) + 100, vizobject.graph.yScale(32.3) + 100, '5px', 'yellow')
        addAnnotationIndicator(group, vizobject.graph.xScale(2020) + 100, vizobject.graph.yScale(28.9) + 100, '5px', 'yellow')
        addLine(group, vizobject.graph.xScale(2020) + 100, vizobject.graph.yScale(28.9) + 95, vizobject.graph.xScale(2020) + 100, vizobject.graph.yScale(28.9) + 30)
        addLine(group, vizobject.graph.xScale(2014) + 100, vizobject.graph.yScale(32.3) + 40, vizobject.graph.xScale(2020) + 100, vizobject.graph.yScale(28.9) + 30)
        addLine(group, vizobject.graph.xScale(2014) + 190, vizobject.graph.yScale(32.3) + 40, vizobject.graph.xScale(2014) + 190, vizobject.graph.yScale(32.3) + 30)
        addAnnotationText(group, vizobject.graph.xScale(2018) - 20, vizobject.graph.yScale(75) + 100, "Year over year drop in mortality")
        addAnnotationText(group, vizobject.graph.xScale(2018) - 20, vizobject.graph.yScale(75) + 120, "has reduced < 1.0/year.")

        addLine(group, vizobject.graph.xScale(2000) + 100, vizobject.graph.yScale(52.8) + 100, vizobject.graph.xScale(2000) + 100, vizobject.graph.yScale(52.8) - 20)
        addLine(group, vizobject.graph.xScale(2009) + 100, vizobject.graph.yScale(38.1) + 100, vizobject.graph.xScale(2009) + 100, vizobject.graph.yScale(38.1) - 50)
        addAnnotationIndicator(group, vizobject.graph.xScale(2000) + 100, vizobject.graph.yScale(52.8) + 100, '5px', 'yellow')
        addAnnotationIndicator(group, vizobject.graph.xScale(2009) + 100, vizobject.graph.yScale(38.1) + 100, '5px', 'yellow')
        addLine(group, vizobject.graph.xScale(2000) + 100, vizobject.graph.yScale(52.8) - 20, vizobject.graph.xScale(2009) + 100, vizobject.graph.yScale(38.1) - 50)
        addLine(group, vizobject.graph.xScale(2000) + 230, vizobject.graph.yScale(52.8) - 35, vizobject.graph.xScale(2000) + 230, vizobject.graph.yScale(52.8) - 20)

        addAnnotationText(group, vizobject.graph.xScale(2000) + 110, vizobject.graph.yScale(52.8) - 50, "Year over year drop in mortality > 1.5/year")

        addAnnotationText(group, vizobject.graph.xScale(2020) - 50, vizobject.graph.yScale(28.9) + 130, "Reduced from 65 deaths to 29 deaths ")
        addAnnotationText(group, vizobject.graph.xScale(2020) - 50, vizobject.graph.yScale(28.9) + 150, "in 2020 - a 59 percent reduction")

    } else if (sceneid == 2) {
        addAnnotationIndicator(group, vizobject.graph.xScale(2020) + 100, vizobject.graph.yScale(62.2) + 100, '5px', 'yellow')
        addLine(group, vizobject.graph.xScale(2020) + 105, vizobject.graph.yScale(62.2) + 100, vizobject.graph.xScale(2020) + 120, vizobject.graph.yScale(62.2) + 100)
        addLine(group, vizobject.graph.xScale(2020) + 120, vizobject.graph.yScale(62.2) + 100, vizobject.graph.xScale(2020) + 120, vizobject.graph.yScale(62.2) + 230)
        addLine(group, vizobject.graph.xScale(2020) + 100, vizobject.graph.yScale(62.2) + 230, vizobject.graph.xScale(2020) + 120, vizobject.graph.yScale(62.2) + 230)
        addAnnotationIndicator(group, vizobject.graph.xScale(2020) + 100, vizobject.graph.yScale(62.2) + 230, '5px', 'yellow')
        addLine(group, vizobject.graph.xScale(2020) + 120, vizobject.graph.yScale(62.2) + 150, vizobject.graph.xScale(2020) - 30, vizobject.graph.yScale(62.2) - 60)
        addAnnotationBullet(group, vizobject.graph.xScale(2018) - 115, vizobject.graph.yScale(75) - 165)
        addAnnotationText(group, vizobject.graph.xScale(2018) - 105, vizobject.graph.yScale(75) - 160, "Gap is getting reduced between African or ")
        addAnnotationText(group, vizobject.graph.xScale(2018) - 110, vizobject.graph.yScale(75) - 135, "low income group with North American or ")
        addAnnotationText(group, vizobject.graph.xScale(2018) - 110, vizobject.graph.yScale(75) - 110, "European group of countries in 2020 ")
        addAnnotationBullet(group, vizobject.graph.xScale(2018) - 115, vizobject.graph.yScale(75) - 85)
        addAnnotationText(group, vizobject.graph.xScale(2018) - 105, vizobject.graph.yScale(75) - 80, "Still African group of countries has 6-7% ")
        addAnnotationText(group, vizobject.graph.xScale(2018) - 110, vizobject.graph.yScale(75) - 55, "of infant mortality")

        addAnnotationIndicator(group, vizobject.graph.xScale(2005) + 100, vizobject.graph.yScale(5.7) + 90, '5px', 'yellow')
        addLine(group, vizobject.graph.xScale(2005) + 100, vizobject.graph.yScale(5.7) + 90, vizobject.graph.xScale(2005) - 100, vizobject.graph.yScale(5.7) - 190)
        addAnnotationText(group, vizobject.graph.xScale(2005) - 200, vizobject.graph.yScale(5.7) - 230, "Europe and North American groups ")
        addAnnotationText(group, vizobject.graph.xScale(2005) - 200, vizobject.graph.yScale(5.7) - 210, "maintain very low rate .")
    } else if (sceneid == 3) {

    }
}

function getCol(matrix, col) {
    var column = [];
    for (var i = 0; i < matrix.length; i++) {
        column.push(matrix[i][col]);
    }
    return column; // return column data..
}

function drawLineChartForEntity(countryid, colourMap, dataMap) {
    let svg = d3.select("svg");
    //console.log(countryid);
    let countrydata = Object.values(dataMap.get(countryid));
    for (i in countrydata) {
        var row = countrydata[i];
        countrydata[i] = Object.values(row);
    }
    var maxRow = countrydata.map(function (row) {
        return Math.max.apply(Math, row);
    });

    let color = colourMap.get(countryid);
    var group = svg.append('g')
        .attr('id', countryid);
    group.append("path")
        .datum(countrydata)
        .attr("class", "line")
        .attr("transform", "translate(" + 100 + "," + 100 + ")")
        .style("fill", "none")
        .style("stroke", color)
        .style("stroke-width", "2")
        .attr("d", function (d) {
            return d3.line()
                .x(function (d) {
                    return vizobject.graph.xScale(d[0]);
                })
                .y(function (d) {
                    //console.log(d);
                    return vizobject.graph.yScale(d[3]);
                })(d)
        })
    var finalx;
    var finaly;
    var label;


    // Define the div for the tooltip
    var tooltipdiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    group
        .selectAll("dot")
        .data(countrydata)
        .enter()
        .append("circle")
        .attr("transform", "translate(" + 100 + "," + 100 + ")")
        .attr("cx", function (d) {
            finalx = d[0];
            return vizobject.graph.xScale(d[0]);
        })
        .attr("cy", function (d) {
            finaly = d[3];
            label = d[1];
            return vizobject.graph.yScale(d[3]);
        })
        .attr("r", 4)
        .attr("stroke", 'white')
        .on("mouseover", function (d) {
            tooltipdiv.transition()
                .style("opacity", 1);
            var country = "Country"
            const params = new URLSearchParams(window.location.search);
            const scene_param = params.get('scene');
            if (scene_param == null || parseInt(scene_param) == 1) {
                tooltipdiv.html("Year:<b> " + d[0] + " </b><br/>Mortality:<b> " + d[3] + "</b>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 70) + "px");
            }
            if (parseInt(scene_param) == 2) {
                country = "Group Name"
                tooltipdiv.html(country + ": <b>" + d[1] + "</b><br/>Year:<b> " + d[0] + " </b><br/>Mortality:<b> " + d[3] + "</b>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 70) + "px");
            }
            if (parseInt(scene_param) == 3) {
                const continent_name = vizobject.countryContinent.get(d[1])
                tooltipdiv.html(country + ": <b>" + d[1] + "</b><br/>Continent Name: <b>" + continent_name + "</b><br/>Year:<b> " + d[0] + " </b><br/>Mortality:<b> " + d[3] + "</b>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 70) + "px");
            }
        })
        .on("mouseout", function (d) {
            tooltipdiv.transition()
                .style("opacity", 0);
        })
        .style("fill", color);
    if (label.length > 12) {
        label = label.substring(0, 11) + '...';
    }
    group.append("text")
        .attr("transform", "translate(" + vizobject.graph.xScale(finalx + 7) + "," + vizobject.graph.yScale(finaly - 53) + ")")
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .style("fill", 'black')
        .style('font', '15px Helvetica')
        .text(label);
}


function removeLineChartForEntity(countryid) {
    d3.select('#' + countryid).remove();

}

function onclickSelectAllFilter() {
    const params = new URLSearchParams(window.location.search);
    const scene_param = params.get('scene');
    const all = params.get('all');
    if (parseInt(all) == 1) {
        var clist = document.getElementsByTagName("input");
        for (var i = 0; i < clist.length; ++i) {
            console.log(clist[i]);
            clist[i].checked = true;
        }
        if (parseInt(scene_param) == 2) {
            for (i in vizobject.countryList) {
                drawLineChartForEntity(vizobject.countryList[i], vizobject.RegionColorMap, vizobject.regionMap);
            }
        }
        if (parseInt(scene_param) == 3) {
            for (i in vizobject.countryList) {
                drawLineChartForEntity(vizobject.countryList[i], vizobject.CountryColorMap, vizobject.countryMap);
            }
        }
    } else {
        onclickClearFilter()
        var group = d3.select("#svg_viz")
            .select("svg")
            .append("g");
        //addAnnotationRect(group, "white")
        if (parseInt(scene_param) == 3)
            document.getElementById("caption_box").innerHTML = caption_box_html_scene_3_clear;
        else if (parseInt(scene_param) == 2) {
            document.getElementById("caption_box").innerHTML = caption_box_html_scene_2_clear;
        }
    }
}

function onclickClearFilter() {
    var clist = document.getElementsByTagName("input");
    for (var i = 0; i < clist.length; ++i) {
        //console.log(clist[i]);
        clist[i].checked = false;
    }
    for (i in vizobject.countryList) {
        removeLineChartForEntity(vizobject.countryList[i]);
    }
}

function onclickScene1() {
    window.location.replace("./index.html?scene=1");
}

function onclickScene2() {
    window.location.replace("./index.html?scene=2");
}

function onclickScene3() {
    window.location.replace("./index.html?scene=3");
}


