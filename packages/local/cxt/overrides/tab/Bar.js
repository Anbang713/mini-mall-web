/**
 * Created by cRazy on 2016/9/7.
 */
Ext.define('overrides.tab.Bar', {
    override: 'Ext.tab.Bar',

    requires: [
        'Ext.container.Container',
        'Ext.tab.Tab'
    ],

    // 这么多私有类，是要作哪样！
    privates: {
        adjustTabPositions: function () {
            var me = this,
                items = me.items.items,
                i = items.length,
                tab, lastBox, el, rotation, prop;

            // When tabs are rotated vertically we don't have a reliable way to position
            // them using CSS in modern browsers.  This is because of the way transform-orign
            // works - it requires the width to be known, and the width is not known in css.
            // Consequently we have to make an adjustment to the tab's position in these browsers.
            // This is similar to what we do in Ext.panel.Header#adjustTitlePosition
            if (!Ext.isIE8) {
                // 'left' in normal mode, 'right' in rtl
                prop = me._getTabAdjustProp();

                while (i--) {
                    tab = items[i];
                    el = tab.el;
                    lastBox = tab.lastBox;
                    rotation = tab.isTab ? tab.getActualRotation() : 0;
                    if (rotation === 1 && tab.isVisible()) {
                        // rotated 90 degrees using the top left corner as the axis.
                        // tabs need to be shifted to the right by their width
                        el.setStyle(prop, (lastBox.x + lastBox.width) + 'px');
                    } else if (rotation === 2 && tab.isVisible()) {
                        // rotated 270 degrees using the bottom right corner as the axis.
                        // tabs need to be shifted to the left by their height
                        el.setStyle(prop, (lastBox.x - lastBox.height) + 'px');
                    }
                }
            }
        },

        applyTargetCls: function (targetCls) {
            this.bodyTargetCls = targetCls;
        },

        // rtl hook
        _getTabAdjustProp: function () {
            return 'left';
        },

        getTargetEl: function () {
            return this.body || this.frameBody || this.el;
        },

        onClick: function (e, target) {
            var me = this,
                tabEl, tab, isCloseClick, tabInfo;

            if (e.getTarget('.' + Ext.baseCSSPrefix + 'box-scroller')) {
                return;
            }

            if (Ext.isIE8 && me.vertical) {
                tabInfo = me.getTabInfoFromPoint(e.getXY());
                tab = tabInfo.tab;
                isCloseClick = tabInfo.close;
            } else {
                // The target might not be a valid tab el.
                tabEl = e.getTarget('.' + Ext.tab.Tab.prototype.baseCls);
                tab = tabEl && Ext.getCmp(tabEl.id);
                isCloseClick = tab && tab.closeEl && (target === tab.closeEl.dom);
            }

            if (isCloseClick) {
                e.preventDefault();
            }

            if (tab && tab.isDisabled && !tab.isDisabled()) {
                // This will focus the tab; we do it before activating the card
                // because the card may attempt to focus itself or a child item.
                // We need to focus the tab explicitly because click target is
                // the Bar, not the Tab.
                tab.beforeClick(isCloseClick);

                if (tab.closable && isCloseClick) {
                    tab.onCloseClick();
                }
                else {
                    me.doActivateTab(tab);
                }
            }
        },

        doActivateTab: function (tab) {
            var tabPanel = this.tabPanel;

            if (tabPanel) {
                // TabPanel will call setActiveTab of the TabBar
                if (!tab.disabled) {
                    tabPanel.setActiveTab(tab.card);
                    if (tab.focusOnClick && tab.card instanceof Ext.container.Container) {
                        tab.card.focusOnFirst();
                    }
                }
            } else {
                this.setActiveTab(tab);
            }
        },

        onFocusableContainerFocus: function (e) {
            var me = this,
                mixin = me.mixins.focusablecontainer,
                child;

            child = mixin.onFocusableContainerFocus.call(me, e);

            if (child && child.isTab) {
                me.doActivateTab(child);
            }
        },

        onFocusableContainerFocusEnter: function (e) {
            var me = this,
                mixin = me.mixins.focusablecontainer,
                child;

            child = mixin.onFocusableContainerFocusEnter.call(me, e);

            if (child && child.isTab) {
                me.doActivateTab(child);
            }
        },

        focusChild: function (child, forward) {
            var me = this,
                mixin = me.mixins.focusablecontainer,
                nextChild;

            nextChild = mixin.focusChild.call(me, child, forward);

            if (me.activateOnFocus && nextChild && nextChild.isTab) {
                me.doActivateTab(nextChild);
            }
        }
    }
});