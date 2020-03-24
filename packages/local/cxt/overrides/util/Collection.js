/**
 * Created by cRazy on 2016/9/18.
 */
Ext.define('overrides.util.Collection', {
    override: 'Ext.util.Collection',

    _aggregators: {
        average: function (items, begin, end, property, root) {
            var n = end - begin;
            return n &&
                this._aggregators.sum.call(this, items, begin, end, property, root) / n;
        },

        bounds: function (items, begin, end, property, root) {
            for (var value, max, min, i = begin; i < end; ++i) {
                value = items[i];
                value = (root ? value[root] : value)[property];

                // First pass max and min are undefined and since nothing is less than
                // or greater than undefined we always evaluate these "if" statements as
                // true to pick up the first value as both max and min.
                if (!(value < max)) { // jshint ignore:line
                    max = value;
                }
                if (!(value > min)) { // jshint ignore:line
                    min = value;
                }
            }

            return [min, max];
        },

        count: function (items) {
            return items.length;
        },

        extremes: function (items, begin, end, property, root) {
            var most = null,
                least = null,
                i, item, max, min, value;

            for (i = begin; i < end; ++i) {
                item = items[i];
                value = (root ? item[root] : item)[property];

                // Same trick as "bounds"
                if (!(value < max)) { // jshint ignore:line
                    max = value;
                    most = item;
                }
                if (!(value > min)) { // jshint ignore:line
                    min = value;
                    least = item;
                }
            }

            return [least, most];
        },

        max: function (items, begin, end, property, root) {
            var b = this._aggregators.bounds.call(this, items, begin, end, property, root);
            return b[1];
        },

        maxItem: function (items, begin, end, property, root) {
            var b = this._aggregators.extremes.call(this, items, begin, end, property, root);
            return b[1];
        },

        min: function (items, begin, end, property, root) {
            var b = this._aggregators.bounds.call(this, items, begin, end, property, root);
            return b[0];
        },

        minItem: function (items, begin, end, property, root) {
            var b = this._aggregators.extremes.call(this, items, begin, end, property, root);
            return b[0];
        },

        sum: function (items, begin, end, property, root) {
            for (var value, sum = 0, i = begin; i < end; ++i) {
                value = items[i];
                value = (root ? value[root] : value)[property];
                if (Ext.isNumeric(value)) {
                    sum += value;
                }
            }

            return sum;
        }
    }
});