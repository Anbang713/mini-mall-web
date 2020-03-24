/**
 * Created by cRazy on 2017/8/24.
 */
Ext.define('Cxt.overrides.form.ConfirmContainer', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'confirmcontainer',

    requires: [
        'Ext.button.Button',
        'Ext.layout.container.Column'
    ],

    /**
     * @cfg {Object} editor
     * 作为确定输入框的编辑器
     */
    editor: undefined,

    initComponent: function () {
        var me = this,
            editor = Ext.apply({
                allowBlank: me.allowBlank,
                flex: 1,
                width: 180
            }, {
                itemId: 'editor'
            }, me.editor);

        Ext.apply(me, {
            layout: 'column',
            items: [editor, {
                xtype: 'button',
                text: '确定',
                ui: 'link',
                width: 50,
                handler: function () {
                    me.doConfirm();
                }
            }, {
                xtype: 'button',
                text: '取消',
                ui: 'link',
                width: 50,
                handler: function () {
                    me.doCancel();
                }
            }]
        });

        me.callParent(arguments);
    },

    onShow: function () {
        var me = this,
            editor = me.down('#editor');
        me.callParent(arguments);

        if (Ext.isFunction(editor.setValue)) {
            editor.setValue();
        }
        if (Ext.isFunction(editor.clearInvalid)) {
            editor.clearInvalid();
        }
    },

    doConfirm: function () {
        var me = this;
        if (!me.isValid())
            return;

        me.fireEvent('confirm', me, me.down('#editor').getValue(), me.down('#editor'));
    },

    doCancel: function () {
        var me = this;
        me.fireEvent('cancel', me, me.down('#editor').getValue(), me.down('#editor'));
    }
});