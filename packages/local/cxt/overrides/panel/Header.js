/**
 * Created by cRazy on 2016/10/8.
 */
Ext.define('overrides.panel.Header', {
    override: 'Ext.panel.Header',

    /**
     * @cfg {'right'/'left'} [toolAlign='left']
     * The side of the title to render the tool.
     */
    toolAlign: 'right',

    applyTitle: function (title, oldTitle) {
        var me = this,
            isString, configHasRotation;

        if (me.toolAlign === 'right') {
            return me.callParent(arguments);
        }

        title = title || '';

        isString = typeof title === 'string';
        if (isString) {
            title = {
                text: title
            };
        }

        if (oldTitle) {
            // several title configs can trigger layouts, so suspend before setting
            // configs in bulk
            Ext.suspendLayouts();
            oldTitle.setConfig(title);
            Ext.resumeLayouts(true);
            title = oldTitle;
        } else {
            if (isString) {
                title.xtype = 'title';
            }
            title.ui = me.ui;
            configHasRotation = ('rotation' in title);

            // Important Panel attribute aria-labelledby depends on title textEl id
            title.id = me.id + '-title';

            if (me.isAccordionHeader) {
                title.ariaRole = 'tab';
                title.textElRole = null;
                title.focusable = true;
            }

            title = Ext.create(title);

            // avoid calling the title's rotation updater on initial startup in the default scenario
            if (!configHasRotation && me.vertical && me.titleRotation === 'default') {
                title.rotation = 1;
            }
        }
        delete title.flex;

        return title;
    },

    applyTitlePosition: function (position) {
        var me = this;
        if (me.toolAlign === 'right') {
            return me.callParent(arguments);
        }
        return 0;
    }
});