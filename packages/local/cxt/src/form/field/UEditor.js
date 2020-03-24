/**
 * 富文本编辑器
 * Created by cRazy on 2017/7/6.
 */
Ext.define('Cxt.form.field.UEditor', {
    extend: 'Ext.container.Container',
    alias: 'widget.ueditor',

    readOnly: false,
    height: 400,

    allowBlank: true,
    blankText: "该输入项为必输项",

    entiretyField: true,

    /** 最大长度*/
    maxLength: 10000,

    /**
     *  自动换行
     */
    wordWrap: true,

    initComponent: function () {
        var me = this;
        if (!me.readOnly) {
            Ext.apply(me, {
                html: '<div><script id="' + me.getId() + '-editor' + '" type="text/plain" style="width:100%;"></script></div>'
            });
        } else {
            Ext.apply(me, {
                style: {
                    wordWrap: me.wordWrap ? 'break-word' : 'normal'
                },
                padding: 10
            });
        }
        me.callParent(arguments);
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        if (!me.readOnly) {
            me.ueditor = UE.getEditor(me.getId() + '-editor');
            me.ueditor.setOpt({
                wordCount:true,
                maximumWords:me.maxLength,
            });
            me.ueditor.addListener('contentChange', function () {
                me.value = me.ueditor.getContent();
                me.fireEvent('change', me, me.value);
                me.publishState('value', me.value);
            });
            me.ueditor.addListener('beforeautosave', function () {
                return false;
            });
        } else {
            me.setScrollable({
                x: !me.wordWrap,
                y: true
            });
        }
    },

    getValue: function () {
        var me = this;
        return me.value;
    },

    setValue: function (value) {
        var me = this;
        if (me.value == value) {
            return;
        }

        if (me.readOnly) {
            me.setHtml(value);
        } else if (me.ueditor && me.ueditor.getContent() != value) {
            me.ueditor.setContent(value);
        }
    },

    getErrors: function () {
        var me = this,
            value = !me.ueditor ? null : me.ueditor.getContent(),
            validator = me.validator,
            errors = [],
            msg, trimmed;

        if (Ext.isFunction(validator)) {
            msg = validator.call(me, value);
            if (msg !== true) {
                errors.push(msg);
            }
        }

        trimmed = me.allowOnlyWhitespace ? value : Ext.String.trim(value);
        if (trimmed.length < 1 || (value === me.emptyText && me.valueContainsPlaceholder)) {
            if (!me.allowBlank) {
                if (!(me.readOnly && me.ignoreBlankWhenReadOnly)) {
                    errors.push(me.blankText);
                }
            }
        }

        return errors;
    },

    beforeDestroy: function () {
        var me = this;
        if (me.ueditor)
            me.ueditor.destroy();
        me.callParent(arguments);
    }
});