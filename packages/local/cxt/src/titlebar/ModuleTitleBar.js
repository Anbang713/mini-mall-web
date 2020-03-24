/**
 * Created by cRazy on 2016/6/27.
 */
Ext.define('Cxt.titlebar.ModuleTitleBar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'moduletitlebar',

    requires: [
        'Ext.form.Label',
        'Ext.toolbar.Toolbar'
    ],

    /**
     * @cfg {Object[]} leftItems
     * 左侧按钮列，
     */

    /**
     * @cfg {String} titleItems
     * 中间的标题控件，也可以直接设置title来构建一个html。
     */

    /**
     * @cfg {Object[]} title
     * 标题，当@link titleItems 为空时会自动构造
     */

    /**
     * @cfg {Object[]} rightItems
     * 右侧按钮列，
     */

    height: 45,
    width: '100%',
    style: 'background-color: white',
    defaults: {
        scale: 'medium'
    },

    initComponent: function () {
        var me = this,
            left = me.createLeft(),
            center = me.createCenter(),
            right = me.createRight();
        Ext.apply(me, {
            items: [left, center, right]
        });
        me.callParent(arguments);
    },

    createLeft: function () {
        var me = this;
        return {
            xtype: 'toolbar',
            ui: 'embed',
            height: 35,
            itemId: 'left',
            items: me.leftItems,
            defaults: {
                scale: 'medium'
            }
        }
    },

    createCenter: function () {
        var me = this,
            titleItems = me.titleItems;

        if (Ext.isEmpty(me.titleItems)) {
            titleItems = [{
                xtype: 'label',
                cls: 'topTitle',
                text: me.title
            }];
        }
        return {
            xtype: 'toolbar',
            ui: 'embed',
            itemId: 'title',
            defaults: {
                scale: 'medium'
            },
            items: Ext.Array.merge('->', titleItems, '->'),
            listeners: {
                resize: function () {
                    me.resizeSides();
                }
            }
        }
    },

    createRight: function () {
        var me = this;
        return {
            xtype: 'toolbar',
            itemId: 'right',
            ui: 'embed',
            height: 35,
            items: Ext.Array.merge('->', me.rightItems),
            defaults: {
                scale: 'medium'
            }
        }
    },

    resizeSides: function () {
        if (!this.rendered || this.destroyed)
            return;
        var me = this,
            title = me.down('#title'),
            left = me.down('#left'),
            right = me.down('#right');

        var width = (me.getWidth() - title.getWidth() - 30) / 2;
        if (width > 0) {
            left.setWidth(width);
            right.setWidth(width);
        }
    }
});