/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 *
 * 注意：禁止修改这个类
 */
Ext.define('Cpnt.Application', {
    extend: 'Ext.app.Application',

    requires: [
        'Ext.app.*',
        'Ext.event.*',
        'Ext.form.field.Base',
        'Ext.form.field.Date',
        'Ext.tip.QuickTipManager',
        'Ext.util.KeyMap',
        'Ext.window.MessageBox',
        'Ext.window.Toast'
    ],

    importRequires: function () {
        console.log(Ext.app.ViewModel);
        console.log(Ext.window.Toast);
        console.log(Ext.Date);
        console.log(Ext.Math);
        console.log(Ext.Array);
    },

    launch: function () {
        //初始化组件的信息提示功能
        Ext.QuickTips.init();
        //指示错误提示出现的方式
        Ext.form.Field.prototype.msgTarget = 'side';

        Ext.Ajax.setTimeout(300000);

        var key = new Ext.KeyMap(document, {
            key: Ext.event.Event.BACKSPACE,
            fn: function (obj, e) {//屏蔽退格键操作
                var type = e.target.type;
                var readonly = e.target.readOnly;
                if (type != 'text' && type != 'textarea' && type != 'password') {
                    e.stopEvent();
                }
                else if (readonly) {
                    e.stopEvent();
                }
            },
            scope: this
        });

        /**
         * 日期控件使用Y-m-d格式，并且支持时间格式输入
         * 暂时不知道为什么overrides中复写无效。
         */
        Ext.override(Ext.form.field.Date, {
            format: 'Y-m-d',
            altFormats: 'Y-m-d|Y-m-d H:i:s'
        });

        Ext.Ajax.on('beforerequest', function (conn, options, eOpts) {
            options.url = Ext.serviceUrl + options.url;

            //从主框架获取sessionId
            if (!options.params) {
                options.params = {};
            }
            options.params["JSESSIONID"] = window.localStorage.getItem("webframe_sessionId");
        });

        Ext.JSON.encodeDate = function (d) {
            return Ext.Date.format(d, '"Y-m-d H:i:s"');
        };

        Ext.Msg.error = function (title, message, fn, scope) {
            Ext.Msg.show({
                title: title,
                message: message,
                fn: fn,
                scope: scope,
                width: 300,
                buttons: Ext.Msg.OK,
                icon: Ext.window.MessageBox.ERROR
            });
        };
    }
});
