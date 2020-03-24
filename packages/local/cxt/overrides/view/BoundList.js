/**
 * Created by cRazy on 2016/9/26.
 */
Ext.define('overrides.view.BoundList', {
    override: 'Ext.view.BoundList',

    requires: [
        'Ext.dom.Element',
        'Ext.tip.ToolTip',
        'Ext.toolbar.Toolbar'
    ],

    /**
     * @cfg {boolean} ellipsis
     * 超宽省略
     */
    ellipsis: true,

    /**
     * @cfg {boolean} showTip
     * 是否冒泡显示。未明确设置时，默认为ellipsis
     */

    renderTpl: [
        '<div id="{id}-listWrap" data-ref="listWrap"',
        ' class="{baseCls}-list-ct ', Ext.dom.Element.unselectableCls, '">',
        '<ul id="{id}-listEl" data-ref="listEl" class="', Ext.baseCSSPrefix, 'list-plain"',
        '<tpl foreach="ariaAttributes"> {$}="{.}"</tpl>',
        '>',
        '</ul>',
        '</div>',
        '{%',
        'var pagingToolbar=values.$comp.pagingToolbar;',
        'if (pagingToolbar) {',
        'Ext.DomHelper.generateMarkup(pagingToolbar.getRenderTree(), out);',
        '}',
        '%}',
        '{%',
        'var fbar=values.$comp.fbar;',
        'if (fbar) {',
        'Ext.DomHelper.generateMarkup(fbar.getRenderTree(), out);',
        '}',
        '%}',
        {
            disableFormats: true
        }
    ],

    /**
     * @cfg {Object/Object[]} fbar
     * Convenience config used for adding items to the bottom of the panel. Short for Footer Bar.
     *     fbar: [
     *       { type: 'button', text: 'Button 1' }
     *     ]
     */
    fbar: null,

    initComponent: function () {
        var me = this;
        if (me.fbar) {
            me.fbar = me.createFootToolbar(me.fbar);
        }
        if (me.pageSize) {
            me.minWidth = 310;
        }

        if (!me.tpl && me.ellipsis) {
            // should be setting aria-posinset based on entire set of data
            // not filtered set
            me.tpl = new Ext.XTemplate(
                '<tpl for=".">',
                '<li role="option" unselectable="on" class="' + me.itemCls + ' ' + Ext.baseCSSPrefix + 'overflow-ellipsis">',
                me.getInnerTpl(me.displayField) + '</li>',
                '</tpl>'
            );
        }

        me.callParent(arguments);
    },

    getRefItems: function () {
        var me = this;
        var result = me.callParent(arguments);

        if (me.fbar) {
            result.push(me.fbar);
        }
        return result;
    },

    createFootToolbar: function (toolbar) {
        if (Ext.isArray(toolbar)) {
            toolbar = {
                xtype: 'toolbar',
                items: toolbar
            };
        } else if (!toolbar.xtype) {
            toolbar.xtype = 'toolbar';
        }

        Ext.apply(toolbar, {
            ownerCt: this,
            ownerLayout: this.getComponentLayout(),
            bindStore: function () {

            }
        });
        return Ext.widget(toolbar);
    },

    createPagingToolbar: function () {
        return Ext.widget('pagingtoolbar', {
            pageSize: this.pageSize,
            store: this.dataSource,
            border: false,
            ownerCt: this,
            ownerLayout: this.getComponentLayout()
        });
    },

    afterRender: function () {
        var me = this,
            showTip = me.showTip == undefined ? me.ellipsis : me.showTip;
        me.callParent(arguments);

        if (!me.tip && showTip) {
            me.tip = Ext.create('Ext.tip.ToolTip', {
                target: me.el, // 所有的目标元素
                delegate: 'li.' + me.itemCls,
                trackMouse: true,// 在行上移动不能隐藏提示框
                renderTo: Ext.getBody(),// 立即呈现，tip.body可参照首秀前。
                listeners: {
                    beforeshow: function updateTipBody(tip) {// 当元素被显示时动态改变内容.
                        if (me.isDestroyed) {// 当前已经别销毁时，不冒泡
                            return false;
                        }
                        if (!tip.triggerElement || !tip.triggerElement.textContent.trim()) {
                            return false;
                        }
                        tip.update(tip.triggerElement.outerText);//获取节点上内容更新提示
                    }
                }
            });
        }
    },

    /**
     * @private
     * @inheritdoc
     */
    beforeDestroy: function () {
        var me = this;

        if (me.rendered) {
            Ext.destroy(
                me.tip
            );
        }
        me.callParent(arguments);
    },

    onDestroy: function () {
        this.callSuper(arguments);
        Ext.destroyMembers(this, 'pagingToolbar', 'fbar', 'listWrap', 'listEl');
    },

    privates: {
        getTargetEl: function () {
            return this.listEl;
        },

        getOverflowEl: function () {
            return this.listWrap;
        },

        // Do the job of a container layout at this point even though we are not a Container.
        finishRenderChildren: function () {
            var me = this;
            me.callParent(arguments);
            if (me.fbar) {
                me.fbar.finishRender();
            }
        }
    }
});