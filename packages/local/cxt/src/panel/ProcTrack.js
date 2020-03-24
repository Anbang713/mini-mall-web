/**
 横向显示状态变化图

 @example
 Ext.syncRequire('Cxt.panel.ProcTrack');
 Ext.create({
		renderTo: document.body,
		xtype: 'proctrack',
		width: 600,
		height: 100,
		value: {
			data: [
	            {text: '已确认', time: '2016-01-01', oper: 'xxx'}, 
	            {text: '已预处理', time: '2016-01-01', oper: 'xxx'}, 
	            {text: '已审核'}, 
	            {text: '已发货'}, 
	            {text: '已妥投'}
        	],
			topTpl: '{text}',
			bottomTpl: '{time}',
			step: 2
		}
	});
 */
Ext.define('Cxt.panel.ProcTrack', {
    extend: 'Ext.draw.Container',
    alias: 'widget.proctrack',

    requires: [
        'Ext.draw.TextMeasurer'
    ],

    initComponent: function () {
        var me = this;
        me.callParent(arguments);
        me.on('boxready', function () {
            me.setValue(me.value);
        });
    },

    /**
     @cfg {Object} value
     @param {Array} data 对象数组
     @param {String} topTpl 用作格式化data[i]的tpl, 显示在上方
     @param {String} bottomTpl 用作格式化data[i]的tpl, 显示在下方
     @param {number} step 0-based, 此元素前的step高亮
     */
    value: {
        data: undefined,
        topTpl: undefined,
        bottomTpl: undefined,
        step: 0
    },

    /**
     * 设置当前步骤到达位置。
     * @param step
     * 步骤位置索引，从0开始。
     */
    setStep: function (step) {
        var me = this;

        me.value.step = step;
        me.setValue(me.value);
    },

    /**
     设置数据.
     @param {Object} value
     数据结构参见value. 如果value中topTpl,bottomTpl和step是undefined, 则使用上次调用setValue()或初始化定义的值.
     */
    setValue: function (value) {
        var me = this,
            surface = me.getSurface(),
            sprites;

        Ext.apply(me.value, value);

        if (me.rendered) {
            sprites = me.createSprites();
            surface.removeAll();
            surface.add(sprites)
            surface.renderFrame();
        }
    },

    createSprites: function () {
        var me = this,
            data = me.value.data,
            step = me.value.step,
            topTpl = new Ext.Template(me.value.topTpl),
            bottomTpl = new Ext.Template(me.value.bottomTpl),
            ox = 10,
            oy = 20,
            iconY = 16,
            bottomY = 40,
            width = me.getWidth(),
            space = (width - 3 * ox) / (data.length - 1),

            big = {
                type: 'circle',
                fillStyle: '#79BB3F',
                r: 6
            },
            small = {
                type: 'circle',
                fillStyle: '#9F9D91',
                r: 4
            },
            bigLine = {
                type: 'line',
                strokeStyle: '#79BB3F',
                lineWidth: 3
            },
            smallLine = {
                type: 'line',
                strokeStyle: '#1F6D91',
                lineWidth: 2
            },
            text = {
                type: 'text',
                font: '12px verdana'
            },
            i,
            x,
            icon,
            texts = [],
            sizes,
            sprites = [];

        for (i = 0; i < data.length; ++i) {
            texts.push({
                top: topTpl.apply(data[i]),
                bottom: bottomTpl.apply(data[i])
            });
        }
        sizes = me.measureTextSizes(texts);

        for (i = 0; i < data.length; ++i) {
            // line
            if (i > 0) {
                sprites.push(Ext.apply({
                    fromX: (i - 1) * space + ox + big.r,
                    toX: i * space + ox + big.r,
                    fromY: iconY + oy,
                    toY: iconY + oy
                }, i <= step ? bigLine : smallLine));
            }
        }

        for (i = 0; i < data.length; ++i) {
            // icon
            sprites.push(Ext.apply({
                x: i * space + ox + big.r,
                y: iconY + oy
            }, i <= step ? big : small));

            // text pos
            if (i === 0)
                x = {
                    top: ox,
                    bottom: ox
                };
            else if (i === data.length - 1)
                x = {
                    top: width - ox - sizes[i].top.width,
                    bottom: width - ox - sizes[i].bottom.width
                };
            else
                x = {
                    top: i * space + ox - sizes[i].top.width / 2,
                    bottom: i * space + ox - sizes[i].bottom.width / 2
                };

            // top text
            sprites.push(Ext.apply({
                x: x.top,
                y: oy,
                text: texts[i].top
            }, text));

            // bottom text
            sprites.push(Ext.apply({
                x: x.bottom,
                y: bottomY + oy,
                text: texts[i].bottom
            }, text));
        }

        return sprites;
    },

    measureTextSizes: function (texts) {
        var sizes = [];
        for (i = 0; i < texts.length; ++i) {
            sizes.push({
                top: Ext.draw.TextMeasurer.measureTextSingleLine(texts[i].top, '12px/1.3 "verdana"'),
                bottom: Ext.draw.TextMeasurer.measureTextSingleLine(texts[i].bottom, '12px/1.3 "verdana"')
            });
        }
        return sizes;
    }
});