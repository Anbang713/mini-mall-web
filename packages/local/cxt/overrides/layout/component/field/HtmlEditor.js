/**
 * Created by cRazy on 2017/7/6.
 */
Ext.define('overrides.layout.component.field.HtmlEditor', {
    override: 'Ext.layout.component.field.HtmlEditor',

    beginLayout: function (ownerContext) {
        var owner = this.owner,
            dom;
        // In gecko, it can cause the browser to hang if we're running a layout with
        // a heap of data in the textarea (think several images with data urls).
        // So clear the value at the start, then re-insert it once we're done
        if (Ext.isGecko) {
            dom = owner.textareaEl.dom;
            this.lastValue = dom.value;
            dom.value = '';
        }
        this.callSuper(arguments);
        ownerContext.toolbarContext = owner.toolbar ? ownerContext.context.getCmp(owner.toolbar) : undefined;
        ownerContext.inputCmpContext = owner.inputCmp ? ownerContext.context.getCmp(owner.inputCmp) : undefined;
        ownerContext.bodyCellContext = ownerContext.getEl('bodyEl');
        ownerContext.textAreaContext = ownerContext.getEl('textareaEl');
        ownerContext.iframeContext = ownerContext.getEl('iframeEl');
    },

    beginLayoutCycle: function (ownerContext) {
        var me = this,
            widthModel = ownerContext.widthModel,
            heightModel = ownerContext.heightModel,
            owner = me.owner,
            iframeEl = owner.iframeEl,
            textareaEl = owner.textareaEl,
            height = (heightModel.natural || heightModel.shrinkWrap) ? me.naturalHeight : '';
        me.callSuper(arguments);
        if (widthModel.shrinkWrap) {
            iframeEl.setStyle('width', '');
            textareaEl.setStyle('width', '');
        } else if (widthModel.natural) {
            ownerContext.bodyCellContext.setWidth(me.naturalWidth);
        }
        if (iframeEl)
            iframeEl.setStyle('height', height);
        if (textareaEl)
            textareaEl.setStyle('height', height);
    }
});