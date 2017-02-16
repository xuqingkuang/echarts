define(function(require) {

    'use strict';

    var SeriesModel = require('../../model/Series');
    var List = require('../../data/List');
    var completeDimensions = require('../../data/helper/completeDimensions');
    var zrUtil = require('zrender/core/util');
    var encodeHTML = require('../../util/format').encodeHTML;

    /**
     * Get angle
     */
    function getAngle(mx, my, px, py) {
        var x = Math.abs(px - mx);
        var y = Math.abs(py - my);
        var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var cos = y / z;
        var radina = Math.acos(cos);
        var angle = Math.floor(180 / (Math.PI / radina));
        if(mx > px && my > py){
            angle = 180-angle;
        }
        if(mx == px && my > py){
            angle = 180;
        }
        if(mx > px && my == py){
            angle = 90;
        }
        if(mx < px && my > py){
            angle = 180 + angle;
        }
        if(mx < px && my == py){
            angle = 270;
        }
        if(mx < px && my < py){
            angle = 360-angle;
        }

        // Turn Echarts radar to be anti-clockwise.
        return 360 - angle;
    };

    /**
     * Get index by position of mouse.
     */
    function getIndexToDisplay(num, angle) {
        var filterIndex = 0;
        for(var i = 0; i < num; i++){
            if (angle > (360 / num * i - 360 / num / 2) && angle < (360 / num * i + 360 / num / 2)) {
                filterIndex = i;
                break;
            }
        }
        return filterIndex;
    };

    var RadarSeries = SeriesModel.extend({

        type: 'series.radar',

        dependencies: ['radar'],


        // Overwrite
        init: function (option) {
            RadarSeries.superApply(this, 'init', arguments);

            // Enable legend selection for each data item
            // Use a function instead of direct access because data reference may changed
            this.legendDataProvider = function () {
                return this.getRawData();
            };
        },

        getInitialData: function (option, ecModel) {
            var data = option.data || [];
            var dimensions = completeDimensions(
                [], data, {extraPrefix: 'indicator_'}
            );
            var list = new List(dimensions, this);
            list.initData(data);
            return list;
        },

        formatTooltip: function (dataIndex, bool, dataType, e) {
            var coordSys = this.coordinateSystem;
            var indicatorAxes = coordSys.getIndicatorAxes();
            var values = zrUtil.map(this.getData().indices, (function(_this) {
                return function(indice, index) {
                    return _this.getRawValue(index);
                };
            })(this));
            var data = this.getData();
            var index = getIndexToDisplay(values[0].length, getAngle(e.offsetX, e.offsetY, coordSys.cx, coordSys.cy));
            return encodeHTML(name === '' ? indicatorAxes[index].name : name) + '<br/>'
                + zrUtil.map(values, function (value, i) {
                    return encodeHTML(data.getName(i) + ' : ' + value[index]);
                }).join('<br />');
        },

        defaultOption: {
            zlevel: 0,
            z: 2,
            coordinateSystem: 'radar',
            legendHoverLink: true,
            radarIndex: 0,
            lineStyle: {
                normal: {
                    width: 2,
                    type: 'solid'
                }
            },
            label: {
                normal: {
                    position: 'top'
                }
            },
            // areaStyle: {
            // },
            // itemStyle: {}
            symbol: 'emptyCircle',
            symbolSize: 4
            // symbolRotate: null
        }
    });

    return RadarSeries;
});