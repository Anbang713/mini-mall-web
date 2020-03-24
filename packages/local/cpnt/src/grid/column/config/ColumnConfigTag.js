/**
 * Created by cRazy on 2016/7/16.
 */
Ext.define('Cpnt.grid.column.config.ColumnConfigTag', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.columnconfigtag',

    requires: [
        'Ext.button.Button',
        'Ext.form.field.Display'
    ],

    width: 150,

    border: true,
    ui: 'drag',

    viewModel: {},
    column: undefined,

    initComponent: function () {
        var me = this, cfg = me.setupConfig();
        Ext.apply(me, cfg);
        me.callParent(arguments);
    },

    setupConfig: function () {
        var me = this,
            column = me.column;

        if (Ext.isEmpty(column)) {
            return {};
        } else if (Ext.isString(column)) {
            return {
                items: [{
                    xtype: 'button',
                    border: false
                }]
            };
        }
        return {
            padding: '0 0 0 10',
            items: [{
                xtype: 'displayfield',
                itemId: column.dataIndex + 'display',
                width: 80,
                fieldStyle: {
                    'textOverflow': 'ellipsis',
                    'overflow': 'hidden',
                    'whiteSpace': 'nowrap',
                    'cursor': 'default'
                },
                value: column.text
            }, '->', {
                xtype: 'button',
                border: false,
                tooltipType: 'title',
                tooltip: column.locked ? '解除锁定' : '锁定',
                iconCls: column.locked ? 'fa fa-lock' : 'fa fa-unlock',
                itemId: column.dataIndex + 'locked',
                hidden: column.hidden,
                listeners: {
                    click: function (btn) {
                        btn.setPressed(true);// 不先启用，会有按下的渲染
                        me.columnLocked(!me.column.locked, true);
                        btn.setPressed(false);
                    }
                }
            }, {
                xtype: 'button',
                border: false,
                tooltipType: 'title',
                tooltip: column.hidden ? '显示' : '隐藏',
                iconCls: column.hidden ? 'fa fa-plus-circle' : 'fa fa-minus-circle',
                itemId: column.dataIndex + 'hidden',
                hidden: column.hideable === false,
                listeners: {
                    click: function (btn) {
                        btn.setPressed(true);// 不先启用，会有按下的渲染
                        me.columnHidden(!me.column.hidden, true);
                        btn.setPressed(false);
                    }
                }
            }]
        }
    },

    setColumn: function (column) {
        var me = this;

        me.column = column;
        me.down('#' + me.column.dataIndex + 'display').setValue(column.text);
        me.down('#' + me.column.dataIndex + 'locked').setIconCls(column.locked ? 'fa fa-lock' : 'fa fa-unlock');
        me.down('#' + me.column.dataIndex + 'locked').setHidden(column.hidden);
        me.down('#' + me.column.dataIndex + 'hidden').setIconCls(column.hidden ? 'fa fa-plus-circle' : 'fa fa-minus-circle');
    },

    columnLocked: function (locked, fireEvent) {
        var me = this;

        me.column.locked = locked;
        me.down('#' + me.column.dataIndex + 'locked').setIconCls(locked ? 'fa fa-lock' : 'fa fa-unlock');
        if (fireEvent) {
            me.fireEvent('columnchange', me, me.column);
        }
    },

    columnHidden: function (hidden, fireEvent) {
        var me = this;

        me.column.hidden = hidden;
        me.down('#' + me.column.dataIndex + 'locked').setHidden(hidden);
        me.down('#' + me.column.dataIndex + 'hidden').setIconCls(hidden ? 'fa fa-plus-circle' : 'fa fa-minus-circle');
        if (fireEvent) {
            me.fireEvent('columnchange', me, me.column);
        }
    },

    setLockable: function (lockable) {
        var me = this;
        me.down('#' + me.column.dataIndex + 'locked').setDisabled(!lockable);
    },

    setHideable: function (lockable) {
        var me = this;
        me.down('#' + me.column.dataIndex + 'hidden').setDisabled(!lockable);
    }
});