;
((w, d) => {

    const YXChart = {

        "data": [{
            "country": "USA",
            "visits": 3025
        }],

        "colors": {
            "saturation": 0.4,
            "list" : [
                "#ff5722"
            ]
        },

        "yAxes": [{
            "type": "CategoryAxis",
            "renderer": {
                "minGridDistance": 20,
                "grid": {
                    "location": 0
                }
            },
            "dataFields": {
                "category": "country"
            }
        }],


        "xAxes": [{
            "type": "ValueAxis",
            "renderer": {
                "maxLabelPosition": 0.98
            }
        }],


        "series": [{
            "name": "test name",
            "type": "ColumnSeries",


            "dataFields": {
                "categoryY": "country",
                "valueX": "visits"
            },


            "defaultState": {
                "ransitionDuration": 1000
            },


            "sequencedInterpolation": true,
            "sequencedInterpolationDelay": 100,


            "columns": {
                "template": {
                    "tooltipText": "",
                    "fill": "#0000ff"
                },
                "strokeOpacity": 0
            }
        }],


        "cursor": {
            "type": "XYCursor",
            "behavior": "zoomY"
        }
    };

    const XYChart = {
        "colors": {
            "saturation": 0.4,
            "list" : [
                "#ff5722"
            ]
        },
        "data": [{
            "country": "USA",
            "visits": 3025
        }],
        "yAxes": [{
            "type": "ValueAxis",
            "renderer": {
                "maxLabelPosition": 0.98
            }
        }],
        "xAxes": [{
            "type": "CategoryAxis",
            "renderer": {
                "minGridDistance": 20,
                "grid": {
                    "location": 0
                }
            },
            "dataFields": {
                "category": "country"
            }
        }],
        "series": [{
            "name": "test name",
            "type": "ColumnSeries",
            "dataFields": {
                "categoryX": "country",
                "valueY": "visits"
            },
            "columns": {
                "template": {
                    "tooltipText": "",
                    "fill": "#0000ff"
                },
                "strokeOpacity": 0
            },
            "defaultState": {
                "ransitionDuration": 1000
            },
            "sequencedInterpolation": true,
            "sequencedInterpolationDelay": 100
        }],
        

        "cursor": {
            "type": "XYCursor",
            "behavior": "zoomX"
        }
    };

    w.site = w.site || {};
    w.site.create_chart = function (options) {
        am4core.useTheme(am4themes_animated);

        if (options.type == 'xy') {
            XYChart.xAxes[0].dataFields.category = options.x;
            XYChart.series[0].dataFields.categoryX = options.x;
            XYChart.series[0].dataFields.valueY = options.y;
            if(options.color){
                XYChart.colors.list[0] = options.color;
            }
           
            XYChart.data = options.data;
            am4core.createFromConfig(XYChart, document.querySelector(options.selector), am4charts.XYChart);
        } else if (options.type == 'yx') {
            YXChart.yAxes[0].dataFields.category = options.y;
            YXChart.series[0].dataFields.categoryY = options.y;
            YXChart.series[0].dataFields.valueX = options.x;
            if(options.color){
                YXChart.colors.list[0] = options.color;
            }
            YXChart.data = options.data;
            am4core.createFromConfig(YXChart, document.querySelector(options.selector), am4charts.XYChart);
        }

      
    };

})(window, document);