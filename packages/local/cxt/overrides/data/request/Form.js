/**
 * Created by cRazy on 2016/11/3.
 */
Ext.define('overrides.data.request.Form', {
    override: 'Ext.data.request.Form',

    start: function (data) {
        var me = this,
            options = me.options;

        // Parent will set the timeout
        me.callParent(arguments);


        if (options.waitMsg) {
            var message = {
                title: options.waitTitle,
                message: options.waitMsg,
                closable: false,
                wait: true,
                modal: true,
                buttons: Ext.Msg.CANCEL,
                fn: function () {
                    me.abort();
                }
            };
            Ext.MessageBox.wait(message);
        }
        return me;
    },

    onComplete: function () {
        var me = this;

        var messageBox = Ext.MessageBox;
        if (messageBox) {
            messageBox.hide();
        }

        me.callParent(arguments);
    }
});