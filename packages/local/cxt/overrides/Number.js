Ext.ROUND_UP = 0;
Ext.ROUND_DOWN = 1;
Ext.ROUND_CEILING = 2;
Ext.ROUND_FLOOR = 3;
Ext.ROUND_HALF_UP = 4;
Ext.ROUND_HALF_DOWN = 5;
Ext.ROUND_HALF_EVEN = 6;
Ext.ROUND_UNNECESSARY = 7;

Ext.Number.MAX_VALUE = 9999999999.99999;
Ext.Number.MIN_VALUE = -9999999999.99999;

/**
 * 取绝对值
 */
Number.prototype.abs = function () {
    var value = this;
    return Math(value);
};

Number.prototype.toFixed = function (fractionalDigits) {
    var number = this, i;
    if (fractionalDigits == undefined)
        fractionalDigits = 0;

    var value = number.scale(fractionalDigits);
    value = String(value);
    var index = value.indexOf(".");
    if (index < 0 && fractionalDigits > 0) {
        value = value + ".";
        for (i = 0; i < fractionalDigits; i++) {
            value = value + "0";
        }
    } else {
        index = value.length - index;
        for (i = 0; i < (fractionalDigits - index) + 1; i++) {
            value = value + "0";
        }
    }
    return value;
};

/**
 * 精度
 * @param scale
 * 精度，若不设置，则返回精度
 * @param roundingMode
 * 与scale搭配使用，默认采用Ext.ROUND_HALF_UP
 * @returns {*}
 */
Number.prototype.scale = function (scale, roundingMode) {
    var number = this;
    if (!number)
        return 0;

    if (arguments.length === 0) {
        var s = number + '';
        s = s.split('.');
        return s[1] ? s[1].length : 0;
    }

    if (Ext.isEmpty(roundingMode)) {
        roundingMode = Ext.ROUND_HALF_UP;
    } else if (Ext.isString(roundingMode)) {
        if (Ext[roundingMode] != undefined) {
            roundingMode = Ext[roundingMode];
        } else if (Ext['ROUND_' + roundingMode] != undefined) {
            roundingMode = Ext['ROUND_' + roundingMode];
        }
    }

    number = parseFloat(number);
    scale = parseInt(scale);
    if (scale >= number.scale()) {
        return number;
    }
    if (scale < 0) {
        scale = 0;
    }

    roundingMode = parseInt(roundingMode);

    if (roundingMode < Ext.ROUND_UP || roundingMode > Ext.ROUND_UNNECESSARY)
        Ext.raise("Invalid rounding mode");

    if (number == 0)
        return number;

    var temp = ('1' + '0'.repeat(scale)) - 0;
    if (roundingMode === Ext.ROUND_UP) {
        if (number < 0) {
            return Math.floor(number * temp) / temp;
        } else {
            return Math.ceil(number * temp) / temp;
        }
    } else if (roundingMode === Ext.ROUND_DOWN) {
        if (number > 0) {
            return Math.floor(number * temp) / temp;
        } else {
            return Math.ceil(number * temp) / temp;
        }
    } else if (roundingMode === Ext.ROUND_CEILING) {
        return Math.ceil(number * temp) / temp;
    } else if (roundingMode === Ext.ROUND_FLOOR) {
        return Math.floor(number * temp) / temp;
    } else if (roundingMode === Ext.ROUND_HALF_UP) {
        var string = String(number);
        if (string.indexOf('.') > 0) {
            if (string.charAt(string.indexOf('.') + scale + 1) == '5') { // 针对于如1.265的精度舍入问题
                return Math[number > 0 ? 'ceil' : 'floor'](number * temp) / temp;
            }
        }
        return Math.round(number * temp) / temp;
    } else if (roundingMode === Ext.ROUND_HALF_DOWN) {
        var r = number * temp;
        if (r - Math.floor(r) > 0.5) {
            return Math.floor(r + 1) / temp;
        }
        return Math.floor(r) / temp;
    } else if (roundingMode === Ext.ROUND_HALF_EVEN) {
        Ext.raise("roundingMode not supported");
    } else if (roundingMode === Ext.ROUND_UNNECESSARY) {
        return number;
    }
};

/** 加法
 * @param addend
 * 加数
 * @param scale
 * 精度
 * @param roundingMode
 */
Number.prototype.add = function (addend, scale, roundingMode) {
    var augend = this;
    addend = Ext.Number.parseValue(addend);
    if (addend == undefined) {
        addend = 0;
    }
    if (scale == undefined) {
        scale = Math.max(augend.scale(), addend.scale());
    }
    return (augend + addend).scale(scale, roundingMode);
};


/**
 * 减法
 * @param subtrahend
 * 减数
 * @param scale
 * 精度
 * @param roundingMode
 */
Number.prototype.subtract = function (subtrahend, scale, roundingMode) {
    var minuend = this;
    subtrahend = Ext.Number.parseValue(subtrahend);
    if (subtrahend == undefined) {
        subtrahend = 0;
    }
    if (scale == undefined) {
        scale = Math.max(minuend.scale(), subtrahend.scale());
    }
    return (minuend - subtrahend).scale(scale, roundingMode);
};

/**
 * 乘法
 * @param multiplier
 * 乘数
 * @param scale
 * 精度
 * @param roundingMode
 */
Number.prototype.multiply = function (multiplier, scale, roundingMode) {
    var multiplicand = this;
    multiplier = Ext.Number.parseValue(multiplier);
    if (multiplicand == 0 || multiplier == undefined || multiplier == 0) {
        return 0
    }
    if (scale == undefined) {
        scale = multiplicand.scale().add(multiplier.scale());
    }
    var baseNum = 0;
    try {
        baseNum += multiplicand.toString().split(".")[1].length;
    } catch (e) {
    }
    try {
        baseNum += multiplier.toString().split(".")[1].length;
    } catch (e) {
    }
    return (Number(multiplicand.toString().replace(".", "")) * Number(multiplier.toString().replace(".", "")) / Math.pow(10, baseNum)).scale(scale, roundingMode);
};

/**
 * 除法
 * @param divisor
 * 除数
 * @param scale
 * 精度
 * @param roundingMode
 */
Number.prototype.divide = function (divisor, scale, roundingMode) {
    var dividend = this;
    divisor = Ext.Number.parseValue(divisor);
    if (divisor == undefined) {
        divisor = 0;
    }
    if (scale == undefined) {
        scale = 2;
    }
    var t1 = 0, t2 = 0, r1, r2;
    try {
        t1 = dividend.toString().split(".")[1].length
    } catch (e) {
    }
    try {
        t2 = divisor.toString().split(".")[1].length
    } catch (e) {
    }
    r1 = Number(dividend.toString().replace(".", ""));
    r2 = Number(divisor.toString().replace(".", ""));
    return (r1 / r2).multiply(Math.pow(10, t2 - t1), scale, roundingMode);
};

Ext.Number.parseValue = function (value) {
    if (value == undefined)
        return;
    value = parseFloat(String(value).replace(Ext.util.Format.decimalSeparator, '.'));
    return isNaN(value) ? null : value;
};

/**
 * 创建一个从[start,end] 的递进step数组。
 */
Ext.Number.list = function (start, end, step) {
    var n = start,
        list = [];
    step = Ext.valueFrom(step, 1);
    while (n <= end) {
        list.push(n);
        n += step;
    }
    return list;
};