/**
 */
Ext.Array.idList = function (array, field) {
    if (!array || !field)
        return;

    var idList = [],
        params = field.split('.');

    Ext.Array.each(array, function (item) {
        var value;
        for (var i = 0; i < params.length; i++) {
            value = item[params[i]];
        }

        idList.push(value);
    });
    return idList;
};

/**
 */
Ext.Array.idMap = function (array, field) {
    if (!array || !field)
        return;

    var idMap = [],
        params = field.split('.');

    Ext.Array.each(array, function (item) {
        var value;
        for (var i = 0; i < params.length; i++) {
            value = item[params[i]];
        }

        idMap[value] = item;
    });
    return idMap;
};

/**
 * Creates a new array with all of the elements of this array for which
 * the provided filtering function returns a truthy value.
 *
 * @param {Array} array
 * @param {Function} fn Callback function for each item.
 * @param {Mixed} fn.item Current item.
 * @param {Number} fn.index Index of the item.
 * @param {Array} fn.array The whole array that's being iterated.
 * @param {Object} scope Callback function scope.
 * @return {Array} results
 */
Ext.Array.filter = ('filter' in Array.prototype) ? function (array, fn, scope) {
    //<debug>
    Ext.Assert.isFunction(fn,
        'Ext.Array.filter must have a filter function passed as second argument.');
    //</debug>

    return array ? array.filter(fn, scope) : array;
} : function (array, fn, scope) {
    //<debug>
    Ext.Assert.isFunction(fn,
        'Ext.Array.filter must have a filter function passed as second argument.');
    //</debug>
    array = Ext.Array.from(array);

    var results = [],
        i = 0,
        ln = array.length;

    for (; i < ln; i++) {
        if (fn.call(scope, array[i], i, array)) {
            results.push(array[i]);
        }
    }

    return results;
};

/**
 *  筛，筛选，滤。
 *  将数组中（fn=false）的item删除。
 *  注意，该方法直接作用于原数组上。
 */
Ext.Array.sieve = function (array, fn, scope) {
    //<debug>
    Ext.Assert.isFunction(fn,
        'Ext.Array.sieve must have a filter function passed as second argument.');
    //</debug>
    array = Ext.Array.from(array);
    for (var i = 0; i < array.length; i++) {
        if (!fn.call(scope, array[i], i, array)) {
            array.splice(i--, 1);
        }
    }
};

/**
 * 将数组倒序。
 */
Ext.Array.reverse = function (array) {
    if (array == undefined) {
        return array;
    }

    var i = 0,
        len = array.length,
        temp;

    for (; i < len - i; i++) {
        temp = array[len - i - 1];
        array[len - i - 1] = array[i];
        array[i] = temp;
    }
    return array;
};
/**
 * 将数组的某个item从fromIdx移动到toIdx。
 *
 * @param array
 *      数组
 * @param fromIdx
 *      起始位，计数从0开始
 * @param toIdx
 *      插入位，计数从0开始
 * @param count
 *      个数
 */
Ext.Array.move = function (array, fromIdx, toIdx, count) {
    if (!array) {
        return;
    }

    count = Ext.valueFrom(count, 1);
    var list = Ext.Array.filter(array, function (item, index) {
        return index >= fromIdx && index < fromIdx + count;
    });

    Ext.Array.removeAt(array, fromIdx, count);
    Ext.Array.insert(array, toIdx - count + 1, list);
    return array;
};

Ext.Array.insert = function (array, index, items) {
    return Ext.Array.replace(array, index, 0, Ext.Array.from(items));
};

/**
 * Removes the specified item from the array if it exists.
 *
 * @param {Array} array The array.
 * @param {Object} item The item to remove.
 *      对此项进行补充，支持数组。
 * @return {Array} The passed array.
 */
Ext.Array.remove = function (array, item) {
    var index = Ext.Array.indexOf(array, item),
        deep = arguments[2];

    if (index !== -1) {
        Ext.Array.erase(array, index, 1);
    } else if (item && item.length > 0 && deep !== false) {
        Ext.Array.each(item, function (val) {
            Ext.Array.remove(array, val, false);
        });
    }

    return array;
};

/**
 * array为空时返回空
 */
Ext.Array.findBy = function (array, fn, scope) {
    if (array == undefined)
        return null;

    var i = 0,
        len = array.length;

    for (; i < len; i++) {
        if (fn.call(scope || array, array[i], i)) {
            return array[i];
        }
    }
    return null;
};

/**
 * 1、结果不为空。
 * 2、过滤空值
 * 3、不做unique处理
 */
Ext.Array.merge = function () {
    var args = Array.prototype.slice.call(arguments),
        array = [],
        i, ln;

    for (i = 0, ln = args.length; i < ln; i++) {
        if (args[i]) {
            array = array.concat(args[i]);
        }
    }

    return array;
};

/**
 * 1、结果不为空。
 * 2、过滤空值
 */
Ext.Array.union = function () {
    var args = Array.prototype.slice.call(arguments),
        array = [],
        i, ln;

    for (i = 0, ln = args.length; i < ln; i++) {
        if (args[i]) {
            array = array.concat(args[i]);
        }
    }

    return Ext.Array.unique(array);
};

/**
 *  重写数组最大值比较
 */
Ext.Array.max = function (array, comparisonFn) {
    var max = array[0],
        i, ln, item;

    for (i = 0, ln = array.length; i < ln; i++) {
        item = array[i];
        if (item == null || item == undefined)
            continue;

        if (max == null || max == undefined) {
            max = item;
            continue;
        }
        if (comparisonFn) {
            if (comparisonFn(max, item) === -1) {
                max = item;
            }
        }
        else {
            if (item > max) {
                max = item;
            }
        }
    }

    return max;
};

/**
 * 重写数组的最小值比较
 */
Ext.Array.min = function (array, comparisonFn) {
    var min = array[0],
        i, ln, item;

    for (i = 0, ln = array.length; i < ln; i++) {
        item = array[i];
        if (item == null || item == undefined)
            continue;

        if (min == null || min == undefined) {
            min = item;
            continue;
        }

        if (comparisonFn) {
            if (comparisonFn(min, item) === 1) {
                min = item;
            }
        }
        else {
            if (item < min) {
                min = item;
            }
        }
    }

    return min;
};


/**
 * Shallow compares the contents of 2 arrays using strict equality.
 * @param {Array} array1
 * @param {Array} array2
 * @return {Boolean} `true` if the arrays are equal.
 */
Ext.Array.equals = function (array1, array2) {
    if (!!array1 != !!array2) // 先判断一下空值
        return false;

    var len1 = array1.length,
        len2 = array2.length,
        i;

    // Short circuit if the same array is passed twice
    if (array1 === array2) {
        return true;
    }

    if (len1 !== len2) {
        return false;
    }

    // 考虑到两个数组的顺序可能有所不同，针对此处进行调整一下。
    for (i = 0; i < len1; ++i) {
        if (Ext.Array.indexOf(array2, array1[i]) < 0)
            return false;
    }

    return true;
};

Ext.Array.list2String = function (array, separator, escape) {
    separator = Ext.valueFrom(separator, ';');
    escape = Ext.valueFrom(escape, '\\');
    if (separator == escape) {
        Ext.raise("separator must not equals escape");
    }
    if (array == null || array == undefined)
        return null;

    array = Ext.Array.from(array);
    var DEFAULT_NULL = '~',
        out = [],
        encode = function (out, input, escape, reservedChars) {
            var i = 0,
                argIdx;
            for (; i < input.length; i++) {
                var c = input.charAt(i),
                    reserved;
                if (c == escape) {
                    out.push(escape);
                } else {
                    reserved = false;
                    argIdx = 3;
                    for (; argIdx < arguments.length; argIdx++) {
                        if (arguments[argIdx] == c) {
                            reserved = true;
                            break;
                        }
                    }
                    if (reserved) {
                        out.push(escape);
                    }
                }
                out.push(c);
            }
        };
    Ext.Array.each(array, function (item) {
        if (out.length > 0) {
            out.push(separator);
        }
        if (item == null) {
            out.push(DEFAULT_NULL);
        } else {
            encode(out, String(item), escape, separator, DEFAULT_NULL);
        }
    });
    return out.join('');
};

Ext.Array.string2List = function (input, separator, escape) {
    separator = Ext.valueFrom(separator, ';');
    escape = Ext.valueFrom(escape, '\\');
    if (separator == escape) {
        Ext.raise("separator must not equals escape");
    }
    if (input == null || input == undefined)
        return null;

    var DEFAULT_NULL = '~',
        list = [],
        word = [],
        escapeOn = false,
        i = 0;
    for (; i < input.length; i++) {
        var c = input.charAt(i);
        if (c == escape) {
            if (escapeOn) {
                word.push(escape);
                escapeOn = false;
            } else {
                escapeOn = true;
            }

        } else if (c == DEFAULT_NULL) {
            if (escapeOn) {
                word.push(DEFAULT_NULL);
                escapeOn = false;
            } else {
                word.push(DEFAULT_NULL);
            }

        } else if (c == separator) {
            if (escapeOn) {
                word.push(separator);
                escapeOn = false;
            } else {
                list.push(word.join(''));
                word.length = 0;
            }

        } else {
            word.push(c);
        }
    }
    if (word.length > 0)
        list.push(word.join(''));
    return list;
};
