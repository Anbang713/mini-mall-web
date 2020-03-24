/**
 纵向显示状态变化图

 @example
 Ext.syncRequire('Cxt.panel.LogTrace');
 Ext.create({
		renderTo: document.body,
		xtype: 'logtracepanel',
		width: 300,
		height: 150,
		value: {
			data: [
				{text: '已确认'},
				{text: '已预处理'},
				{text: '已审核'},
				{text: '已发货'},
				{text: '已揽收'},
				{text: '已妥投'}
			],
			tpl: '状态: {text}',
			highlight: 0
		}
	});
 */
Ext.define('Cxt.panel.LogTrace', {
    extend: 'Ext.container.Container',
    alias: 'widget.logtracepanel',

    requires: [
        'Ext.container.Container'
    ],

    /**
     * @cfg {boolean} lineHeight
     * 行高
     */
    lineHeight: 20,

    /**
     * @cfg {boolean} autoHeight
     * 启动autoHeight后，加载数据之后会自动设置高度。
     */
    autoHeight: true,

    /**
     * @cfg {number} height
     * 如果需要固定高度，需要将autoHeight设置为false。
     */
    height: 300,

    highlightColor: '#333',

    normalColor: '#333',

    config: {

        /**
         @cfg {Object} value
         @param {Array} data 对象数组
         @param {String} tpl 用作格式化data[i]的tpl
         @param {number} highlight 0-based, 此元素前的icon高亮
         */
        value: {
            data: undefined,
            tpl: undefined,
            highlight: 0
        }
    },

    items: [{
        xtype: 'container',
        itemId: 'drawContainer',
        height: 300
    }],

    afterRender: function () {
        var me = this;
        me.callParent(arguments);

        me.refreshLogTrace();
    },

    /**
     设置数据.
     @param {Object} value
     数据结构参见value. 如果value中tpl和highlight是undefined, 则使用上次调用setValue()或初始化定义的值.
     */
    setValue: function (value) {
        var me = this;

        value = Ext.apply({}, value, me.getValue());
        me.value = value;
        me.refreshLogTrace();
    },

    refreshLogTrace: function () {
        var me = this,
            ox = 20,
            oy = 24,
            iconX = 0,
            textX = 22,
            lineHeight = me.lineHeight,
            data = Ext.Array.from(me.value.data),
            highlight = me.value.highlight,
            tpl = me.value.tpl && me.value.tpl.isTemplate ? me.value.tpl : new Ext.XTemplate(me.value.tpl);

        if (me.destroyed || !me.rendered) {
            return;
        }

        if (me.chart) {
            try {
                // me.chart.destroy();
            } catch (e) {
            }
        }
        if (data) {
            me.down('#drawContainer').setHeight(me.lineHeight * data.length + 10);
        }
        me.chart = Highcharts.chart(me.down('#drawContainer').getId(), {
            title: null,
            credits: {// 取消水印，必须的
                enabled: false
            },
            loading: {
                labelStyle: {
                    top: '80px'
                }
            }
        });

        if (me.autoHeight) {
            var height = data.length * 30 + 20;
            me.setHeight(height < 300 ? height : 300);
        }

        Ext.Array.each(data, function (item, index) {
            if (index > 0) {
                me.chart.renderer.path(['M', iconX + ox, (index - 1) * lineHeight + oy, 'L', iconX + ox, index * lineHeight + oy])
                    .attr({
                        stroke: '#9F9D91',
                        'stroke-width': 2
                    }).add();
            }
            me.chart.renderer.circle(iconX + ox, index * lineHeight + oy, index == highlight ? 6 : 4)
                .css({
                    fill: index == highlight ? '#5FA2DD' : '#9F9D91'
                }).add();
            me.chart.renderer.label(tpl.apply(item), textX + ox, index * lineHeight + oy - 10)
                .css({
                    padding: 2,
                    r: 2,
                    color: index == highlight ? me.highlightColor : me.normalColor
                }).add();
        });
    },

    showLoading: function (loading) {
        var me = this;
        if (me.chart) {
            me.chart.showLoading(loading ? loading : '正在加载...');
        }
    },

    hideLoading: function () {
        var me = this;
        if (me.chart) {
            me.chart.hideLoading();
        }
    }
});