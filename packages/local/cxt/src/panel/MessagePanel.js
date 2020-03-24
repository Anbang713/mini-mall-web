/**
 * Created by cRazy on 2016/7/9.
 */
Ext.define('Cxt.panel.MessagePanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'messagepanel',

    requires: [
        'Ext.button.Button',
        'Ext.form.Label',
        'Ext.layout.container.VBox',
        'Ext.panel.Panel',
        'Ext.tab.Panel'
    ],

    width: '100%',
    layout: 'vbox',

    ui: 'message',
    border: true,
    closable: true,

    bodyPadding: '0 0 5 25',

    /**
     * @cfg {Object[]} messages
     *  错误消息
     *     @example
     *     messages: [{
     *         itemId: 'button-1001',
     *         text: 项目不能为空,
     *     }];
     */
    messages: undefined,

    /**
     * @cfg {String} [fieldCls="x-label-link"]
     * link的样式
     */
    linkCls: Ext.baseCSSPrefix + 'label-link',

    infoText: '错误信息',

    initComponent: function () {
        var me = this,
            closable = me.closable;

        Ext.apply(me, {
            closable: false,
            dockedItems: [{
                xtype: 'toolbar',
                ui: 'message',
                items: [{
                    xtype: 'button',
                    ui: 'hint',
                    html: '<span class="fa fa-exclamation-circle" style="text-align:right;width:20px;color: #F16152;font-size:18px;"></span>'
                }, {
                    xtype: 'label',
                    style: 'color: #F16152;font-size:14px;',
                    html: me.infoText,
                    itemId: 'infoLabel',
                    flex: 1
                }, {
                    xtype: 'button',
                    itemId: 'closeBtn',
                    ui: 'hint',
                    width: 40,
                    html: '<span style="font-size: 20px">×</span>',
                    handler: function () {
                        me.hide();
                    }
                }]
            }]
        });

        me.callParent(arguments);
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        me.refreshMessages();
    },

    /**
     * 设置消息列表
     * @param {Object[]} messages
     */
    setMessages: function (messages) {
        var me = this;
        me.messages = messages;
        me.refreshMessages();
    },

    /**
     * Remove all messages
     */
    clearMessages: function () {
        var me = this;
        delete me.messages;
        me.refreshMessages();
    },

    setRoot: function (root) {
        this.root = root;
    },

    refreshMessages: function () {
        var me = this,
            items = [];

        me.removeAll();

        if (Ext.isEmpty(me.messages)) {
            me.hide();
            return;
        }
        Ext.Array.each(me.messages, function (message) {
            items.push({
                xtype: 'label',
                html: message.text,
                cls: me.linkCls,
                margin: '2 0 2 0',
                listeners: {
                    click: {
                        element: 'el',
                        fn: function () {
                            me.onMessageSelect(message);
                        }
                    }
                }
            });
        });

        me.add(items);
        if (items.length > 10) {
            me.setHeight(250);
        } else {
            me.setHeight(items.length * 21 + 40);
        }

        me.show();
    },

    onMessageSelect: function (message) {
        var me = this;

        if (!message.source)
            return;
        me.sourceTrace(message.source);

        Ext.defer(function () {
            if (Ext.isFunction(message.source.focus)) {
                message.source.focus();
            }
            me.fireEvent('select', me, message);
        }, 200);
    },

    sourceTrace: function (item) {
        if (!item)
            return;
        if (item.cellError === true && item.grid)
            item = item.grid;
        if (item instanceof Ext.Component == false)
            return;

        var me = this,
            up = item.up();

        if (up instanceof Ext.tab.Panel) {
            up.setActiveItem(item.getItemId());
        }
        me.sourceTrace(up);
    },

    setInfoText: function (infoText) {
        var me = this;
        me.down('#infoLabel').setHtml(Ext.isEmpty(infoText) ? me.infoText : infoText);
    }
});