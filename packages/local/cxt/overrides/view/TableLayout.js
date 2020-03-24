/**
 * Created by cRazy on 2016/10/17.
 */
Ext.define('overrides.view.TableLayout', {
    override: 'Ext.view.TableLayout',

    measureContentHeight: function (ownerContext) {
        var owner = this.owner,
            bodyDom = owner.body.dom,
            emptyEl = owner.emptyEl,
            bodyHeight = 0;

        if (emptyEl) {
            bodyHeight += emptyEl.offsetHeight;
        }

        if (bodyDom) {
            bodyHeight += bodyDom.offsetHeight;
        }

        // This will have been figured out by now because the columnWidths have been
        // published...
        if (ownerContext.headerContext.state.boxPlan && ownerContext.headerContext.state.boxPlan.tooNarrow) {
            bodyHeight += Ext.getScrollbarSize().height;
        }

        return bodyHeight;
    }
});