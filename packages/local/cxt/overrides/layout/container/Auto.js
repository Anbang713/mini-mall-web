/**
 * Created by cRazy on 2016/9/22.
 */
Ext.define('overrides.layout.container.Auto', {
    override: 'Ext.layout.container.Auto',
    beginLayoutCycle: function (ownerContext) {
        var me = this,
            outerCt = me.outerCt,
            lastOuterCtWidth = me.lastOuterCtWidth || '',
            lastOuterCtHeight = me.lastOuterCtHeight || '',
            lastOuterCtTableLayout = me.lastOuterCtTableLayout || '',
            state = ownerContext.state,
            overflowXStyle, outerCtWidth, outerCtHeight, outerCtTableLayout,
            inheritedStateInner;

        me.callSuper(arguments);

        // Default to "shrink wrap styles".
        outerCtWidth = outerCtHeight = outerCtTableLayout = '';

        if (!ownerContext.widthModel.shrinkWrap) {
            // if we're not shrink wrapping width, we need to get the innerCt out of the
            // way to avoid any shrink wrapping effect on child items

            // fill the available width within the container
            outerCtWidth = '100%';
            inheritedStateInner = me.owner.inheritedStateInner;
            // expand no further than the available width, even if contents are wider
            // unless there is a potential for horizontal overflow, then allow
            // the outerCt to expand to the width of the contents
            overflowXStyle = me.getOverflowXStyle(ownerContext);
            outerCtTableLayout = (inheritedStateInner.inShrinkWrapTable ||
            overflowXStyle === 'auto' ||
            overflowXStyle === 'scroll') ? '' : 'fixed';
        }

        if (!ownerContext.heightModel.shrinkWrap && !Ext.supports.PercentageHeightOverflowBug) {
            // if we're not shrink wrapping height, we need to get the outerCt out of the
            // way so that percentage height children will be sized correctly.  We do this
            // by giving the outerCt a height of '100%' unless the browser is affected by
            // the "percentage height overflow bug", in which case the outerCt will get a
            // pixel height set during the calculate phase after we know the targetEl size.
            outerCtHeight = '100%';
        }

        // if the outerCt width changed since last time (becuase of a widthModel change)
        // or if we set a pixel width on the outerCt last time to work around a browser-
        // specific bug, we need to set the width of the outerCt
        if ((outerCtWidth !== lastOuterCtWidth) || me.hasOuterCtPxWidth) {
            if (outerCt.dom) {
                outerCt.setStyle('width', outerCtWidth);
            }
            me.lastOuterCtWidth = outerCtWidth;
            me.hasOuterCtPxWidth = false;
        }

        // Set the outerCt table-layout property if different from last time.
        if (outerCtTableLayout !== lastOuterCtTableLayout) {
            if (outerCt.dom) {
                outerCt.setStyle('table-layout', outerCtTableLayout);
            }
            me.lastOuterCtTableLayout = outerCtTableLayout;
        }

        // if the outerCt height changed since last time (becuase of a heightModel change)
        // or if we set a pixel height on the outerCt last time to work around a browser-
        // specific bug, we need to set the height of the outerCt
        if ((outerCtHeight !== lastOuterCtHeight) || me.hasOuterCtPxHeight) {
            if (outerCt.dom) {
                outerCt.setStyle('height', outerCtHeight);
            }
            me.lastOuterCtHeight = outerCtHeight;
            me.hasOuterCtPxHeight = false;
        }

        if (me.hasInnerCtPxHeight) {
            me.innerCt.setStyle('height', '');
            me.hasInnerCtPxHeight = false;
        }

        // Begin with the scrollbar adjustment that we used last time - this is more likely
        // to be correct than beginning with no adjustment at all, but only if it is not
        // already defined - it may have already been set by invalidate()
        state.overflowAdjust = state.overflowAdjust || me.lastOverflowAdjust;
    }
});