/**
 * Created by cRazy on 2016/10/29.
 */
Ext.define('overrides.window.MessageBox', {
    override: 'Ext.window.MessageBox',

    show: function (cfg) {
        var me = this;
        if (cfg.prompt && cfg.multiline) {
            cfg.minWidth = cfg.minWidth * 2;
        }
        if (cfg.title && cfg.allowBlank == false && cfg.title.startsWith('<span style="font-weight: 700;font-size: 12px;color: #DD6550;">') == false) {
            cfg.title = '<span style="font-weight: 700;font-size: 12px;color: #DD6550;">*&nbsp;</span>' + cfg.title;
        }

        me.callParent(arguments);

        if (cfg.multiline) {
            me.textArea.setAllowBlank(cfg.allowBlank !== false);
            me.textArea.maxLength = Ext.isNumeric(cfg.maxLength) ? cfg.maxLength : Number.MAX_VALUE;

        } else {
            me.textField.setAllowBlank(cfg.allowBlank !== false);
            me.textField.maxLength = Ext.isNumeric(cfg.maxLength) ? cfg.maxLength : Number.MAX_VALUE;
            me.textField.regex = cfg.regex;
            me.textField.regexText = cfg.regexText;
        }
        return me;
    },

    onShow: function () {
        this.callParent(arguments);
        if (!Ext.MessageBox.windowsManagers) {
            // 在MessageBox 中注册。这样可以在模块销毁的时候将对话框关闭
            Ext.MessageBox.windowsManagers = [];
        }
        Ext.MessageBox.windowsManagers.push(this);
    },

    btnCallback: function (btn, event) {
        var me = this,
            value, field;
        // If this is caused by a keydown event (eg: SPACE on a Button), then the
        // hide will throw focus back to the previously focused element which will
        // then recieve an unexpected keyup event.
        // So defer callback handling until the upcoming keyup event.
        if (event && event.type === 'keydown' && !event.isSpecialKey()) {
            event.getTarget(null, null, true).on({
                keyup: function (e) {
                    me.btnCallback(btn, e);
                },
                single: true
            });
            return;
        }
        if (me.cfg.prompt || me.cfg.multiline) {
            if (me.cfg.multiline) {
                field = me.textArea;
            } else {
                field = me.textField;
            }
            if (btn.itemId != 'cancel' && !field.isValid())
                return;

            value = field.getValue();
            field.reset();
        }
        // Component.onHide blurs the active element if the Component contains the active element
        me.hide();
        me.userCallback(btn.itemId, value, me.cfg);
    }
});