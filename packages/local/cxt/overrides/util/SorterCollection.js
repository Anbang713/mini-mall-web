/**
 * Created by cRazy on 2016/12/28.
 */
Ext.define('overrides.util.SorterCollection', {
    override: 'Ext.util.SorterCollection',

    addSort: function (property, direction, mode) {
        var me = this,
            count, index, limit, options, primary, sorter, sorters;

        if (!property) {
            // nothing specified so just trigger a sort...
            me.beginUpdate();
            me.endUpdate();
        } else {
            options = me.getOptions();

            if (property instanceof Array) {
                sorters = property;
                mode = direction;
                direction = null;
            } else if (Ext.isString(property)) {
                if (!(sorter = me.get(property))) {
                    sorters = [{
                        property: property,
                        direction: direction || options.getDefaultSortDirection()
                    }];
                } else {
                    sorters = [sorter];
                }
            } else if (Ext.isFunction(property)) {
                sorters = [{
                    sorterFn: property,
                    direction: direction || options.getDefaultSortDirection()
                }];
            } else {
                //<debug>
                if (!Ext.isObject(property)) {
                    Ext.raise('Invalid sort descriptor: ' + property);
                }
                //</debug>
                // 改了这里，对sorters做了补充
                me.each(function (item) {
                    sorter = item.dataIndex == property.dataIndex ? item : null;
                    return !sorter;
                });

                if (sorter) {
                    sorters = [sorter];
                } else {
                    sorters = [property];
                }

                mode = direction;
                direction = null;
            }

            //<debug>
            if (mode && !me._sortModes[mode]) {
                Ext.raise(
                    'Sort mode should be "multi", "append", "prepend" or "replace", not "' +
                    mode + '"');
            }
            //</debug>
            mode = me._sortModes[mode || 'replace'];

            primary = me.getAt(0);
            count = me.length;
            index = mode.append ? count : 0;

            // We have multiple changes to make, so mark the sorters collection as updating
            // before we start.
            me.beginUpdate();

            // Leverage the decode logic wired to the collection to up-convert sorters to
            // real instances.
            me.splice(index, mode.replace ? count : 0, sorters);

            if (mode.multi) {
                count = me.length;
                limit = options.getMultiSortLimit();

                if (count > limit) {
                    me.removeAt(limit, count); // count will be truncated
                }
            }

            if (sorter && direction) {
                sorter.setDirection(direction);
            } else if (index === 0 && primary && primary === me.getAt(0)) {
                // If we just adjusted the sorters at the front and the primary sorter is
                // still the primary sorter, toggle its direction:
                primary.toggle();
            }

            me.endUpdate();
        }
    }
});