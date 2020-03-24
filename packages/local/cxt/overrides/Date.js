Ext.Date.defaultFormat = 'Y-m-d';
Ext.Date.altFormats = 'Y-m-d|Y-m-d H:i:s';

/**
 * 计算返回指定日期的当天结束时间。
 * @param date The date
 * @returns 结束时间
 */
Ext.Date.endOfTheDate = function (date) {
    if (!date)
        return null;

    date = Ext.Date.clearTime(date, true);
    return Ext.Date.add(Ext.Date.add(date, Ext.Date.DAY, 1), Ext.Date.SECOND, -1);
};

/** 取日期间隔时段的截止日期。
 *
 * @param date
 * 起始日期
 * @param months
 * 月数
 * @param days
 * 天数
 */
Ext.Date.interval = function (date, months, days) {
    if (!date)
        return null;
    var result = Ext.Date.parse(date);

    months = Ext.Number.from(months, 0);
    days = Ext.Number.from(days, 0);
    if (months == 0 && days == 0)
        return null;// 无区间

    if (result.getDate() > 1) {
        result = Ext.Date.add(result, Ext.Date.DAY, -1);//往前推一天
        result = Ext.Date.add(result, Ext.Date.MONTH, months);
        result = Ext.Date.add(result, Ext.Date.DAY, days);
    } else {
        result = Ext.Date.add(result, Ext.Date.MONTH, months);
        result = Ext.Date.add(result, Ext.Date.DAY, days - 1);// 加天数
    }
    return result < date ? null : result;
};

/**
 * 截取Date类型值到指定字段。
 *
 * @param date
 *          输入Date。
 * @param [unit]
 *          unit The unit. This unit is compatible with the date interval constants.
 *
 */
Ext.Date.truncate = function (date, unit) {
    if (!date) {
        return date;
    }
    date = Ext.Date.parse(date);
    unit = Ext.valueFrom(unit, Ext.Date.DAY);

    if (unit == Ext.Date.MILLI) {
        return date;
    } else if (unit == Ext.Date.SECOND) {
        date.setMilliseconds(0);
    } else if (unit == Ext.Date.MINUTE) {
        date.setSeconds(0);
        date.setMilliseconds(0);
    } else if (unit == Ext.Date.HOUR) {
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
    } else if (unit == Ext.Date.DAY) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
    } else if (unit == Ext.Date.MONTH) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    } else if (unit == Ext.Date.YEAR) {
        return new Date(date.getFullYear(), 1, 1);
    }
    return date;
};

/**
 * 计算两个日期区间的交叉区间
 * @param one
 * 一个区间
 * @param another
 * 另一个区间
 * 例如：{beginDate:'2010-1-1'}X{endDate;'2011-1-1'}={beginDate:'2010-1-1',endDate:'2011-1-1'}
 * 例如：{beginDate:'2010-1-1'}X{beginDate;'2011-1-1'}={beginDate:'2011-1-1'}
 */
Ext.Date.overlap = function (one, another) {
    if (!one || !another)
        return;

    one.beginDate = Ext.Date.parse(one.beginDate);
    one.endDate = Ext.Date.parse(one.endDate);
    another.beginDate = Ext.Date.parse(another.beginDate);
    another.endDate = Ext.Date.parse(another.endDate);

    var beginDate, endDate;
    if (one.beginDate && !another.beginDate) {
        beginDate = one.beginDate;
    } else if (!one.beginDate && another.beginDate) {
        beginDate = another.beginDate;
    } else {
        beginDate = one.beginDate > another.beginDate ? one.beginDate : another.beginDate;
    }
    if (one.endDate && !another.endDate) {
        endDate = one.endDate;
    } else if (!one.endDate && another.endDate) {
        endDate = another.endDate;
    } else {
        endDate = one.endDate < another.endDate ? one.endDate : another.endDate;
    }
    if (beginDate && endDate && beginDate > endDate)
        return;
    return {
        beginDate: beginDate,
        endDate: endDate
    };
};

/**
 * 判断时间区间是否包含另一个区间
 * @param one
 * 一个区间
 * @param another
 * 另一个区间
 */
Ext.Date.include = function (one, another) {
    if (!one || !another)
        return false;

    one.beginDate = Ext.Date.parse(one.beginDate);
    one.endDate = Ext.Date.parse(one.endDate);
    another.beginDate = Ext.Date.parse(another.beginDate);
    another.endDate = Ext.Date.parse(another.endDate);

    if (one.beginDate == null || one.endDate == null) {
        return false;
    } else if (another.beginDate == null || another.endDate == null) {
        return false;
    } else if (one.beginDate > another.beginDate || one.endDate < another.endDate) {
        return false;
    }
    return true;
};

/**
 * 计算两个日期区间的交叉区间天数
 * 0。表示无交叉。
 * -1。表示无法计算。如：{beginDate:'2010-1-1'}X{beginDate;'2011-1-1'}
 * @param one
 * 一个区间
 * @param another
 * 另一个区间
 */
Ext.Date.overlapDays = function (one, another) {
    var period = Ext.Date.overlap(one, another);
    if (!period)
        return 0;
    return Ext.Date.diff(period.beginDate, period.endDate, Ext.Date.DAY);
};

/**
 * Calculate how many units are there between two time.
 * @param {Date/Object} min The first time.
 *      支持对象如：{beginDate:'2011-1-1',endDate:'2011-12-31'}
 * @param {Date} [max] The second time.
 * @param {String} [unit] The unit. This unit is compatible with the date interval constants.
 *      默认为天。
 *      当unit = Ext.Date.MONTH 的时候，计算月数。
 * @return {Number} The maximum number n of units that min + n * unit <= max.
 * 当min or max 为空时，返回-1.表示无法计算。
 * 当min > max 时，返回0。
 */
Ext.Date.diff = function (min, max, unit) {
    if (min && min['beginDate'] && min['endDate']) {
        return Ext.Date.diff(min['beginDate'], min['endDate'], min['unit']);
    }
    if (!min || !max) {
        return -1;
    }
    max = Ext.Date.parse(max);
    min = Ext.Date.parse(min);
    if (min > max)
        return 0;

    var month, bDate, eDate,
        diff = +max - min;
    switch (unit) {
        case Ext.Date.MILLI:
            return diff;
        case Ext.Date.SECOND:
            return Math.floor(diff / 1000);
        case Ext.Date.MINUTE:
            return Math.floor(diff / 60000);
        case Ext.Date.HOUR:
            return Math.floor(diff / 3600000);
        // case Ext.Date.DAY:
        //     return Math.floor(diff / 86400000) + 1;// 多一天
        case 'w':
            return Math.floor(diff / 604800000);
        case Ext.Date.MONTH:
            month = 0;
            bDate = Ext.Date.clearTime(min);
            eDate = Ext.Date.clearTime(max);
            while (Ext.Date.interval(bDate, month + 1, 0) <= eDate) {
                month++;
            }
            bDate = Ext.Date.add(bDate, Ext.Date.MONTH, month);
            return month + Ext.Date.diff(bDate, max, Ext.Date.DAY).divide(Ext.Date.getLastDateOfMonth(bDate).getDate());
        case Ext.Date.YEAR:
            month = Ext.Date.diff(min, max, Ext.Date.MONTH);
            return month.divide(12, 4);
        default:
            Ext.Date.clearTime(max);
            Ext.Date.clearTime(min);
            diff = +max - min;
            return Math.floor(diff / 86400000) + 1;// 多一天
    }
};

/**
 *  增加空值处理
 */
Ext.Date.add = function (date, interval, value) {
    if (!date)
        return date;

    var d = Ext.Date.parse(date),
        day, decimalValue, base = 0;
    if (!interval || value === 0) {
        return d;
    }

    decimalValue = value - parseInt(value, 10);
    value = parseInt(value, 10);

    if (value) {
        switch (interval.toLowerCase()) {
            // See EXTJSIV-7418. We use setTime() here to deal with issues related to
            // the switchover that occurs when changing to daylight savings and vice
            // versa. setTime() handles this correctly where setHour/Minute/Second/Millisecond
            // do not. Let's assume the DST change occurs at 2am and we're incrementing using add
            // for 15 minutes at time. When entering DST, we should see:
            // 01:30am
            // 01:45am
            // 03:00am // skip 2am because the hour does not exist
            // ...
            // Similarly, leaving DST, we should see:
            // 01:30am
            // 01:45am
            // 01:00am // repeat 1am because that's the change over
            // 01:30am
            // 01:45am
            // 02:00am
            // ....
            //
            case Ext.Date.MILLI:
                d.setTime(d.getTime() + value);
                break;
            case Ext.Date.SECOND:
                d.setTime(d.getTime() + value * 1000);
                break;
            case Ext.Date.MINUTE:
                d.setTime(d.getTime() + value * 60 * 1000);
                break;
            case Ext.Date.HOUR:
                d.setTime(d.getTime() + value * 60 * 60 * 1000);
                break;
            case Ext.Date.DAY:
                d.setDate(d.getDate() + value);
                break;
            case Ext.Date.MONTH:
                day = d.getDate();
                if (day > 28) {
                    day = Math.min(day, Ext.Date.getLastDateOfMonth(Ext.Date.add(Ext.Date.getFirstDateOfMonth(d), Ext.Date.MONTH, value)).getDate());
                }
                d.setDate(day);
                d.setMonth(d.getMonth() + value);
                break;
            case Ext.Date.YEAR:
                day = d.getDate();
                if (day > 28) {
                    day = Math.min(day, Ext.Date.getLastDateOfMonth(Ext.Date.add(Ext.Date.getFirstDateOfMonth(d), Ext.Date.YEAR, value)).getDate());
                }
                d.setDate(day);
                d.setFullYear(d.getFullYear() + value);
                break;
        }
    }

    if (decimalValue) {
        switch (interval.toLowerCase()) {
            case Ext.Date.MILLI:
                base = 1;
                break;
            case Ext.Date.SECOND:
                base = 1000;
                break;
            case Ext.Date.MINUTE:
                base = 1000 * 60;
                break;
            case Ext.Date.HOUR:
                base = 1000 * 60 * 60;
                break;
            case Ext.Date.DAY:
                base = 1000 * 60 * 60 * 24;
                break;

            case Ext.Date.MONTH:
                day = Ext.Date.getDaysInMonth(d);
                base = 1000 * 60 * 60 * 24 * day;
                break;

            case Ext.Date.YEAR:
                day = (Ext.Date.isLeapYear(d) ? 366 : 365);
                base = 1000 * 60 * 60 * 24 * day;
                break;
        }
        if (base) {
            d.setTime(d.getTime() + base * decimalValue);
        }
    }

    return d;
};

/**
 * Compares if two dates are equal by comparing their values.
 * @param {Date} date1
 * @param {Date} date2
 * @param {String} [interval] A valid date interval enum value.
 *          默认为天
 * @return {Boolean} `true` if the date values are equal
 */
Ext.Date.isEqual = function (date1, date2, interval) {
    interval = Ext.valueFrom(interval, Ext.Date.DAY);
    // check we have 2 date objects
    date1 = Ext.Date.truncate(Ext.Date.parse(date1), interval);
    date2 = Ext.Date.truncate(Ext.Date.parse(date2), interval);
    if (date1 && date2) {
        return (date1.getTime() === date2.getTime());
    }
    // one or both isn't a date, only equal if both are falsey
    return !(date1 || date2);
};

Ext.Date.clearTime = function (date, clone) {
    date = Ext.Date.parse(date);

    if (!date)
        return date;

    if (clone) {
        return Ext.Date.clearTime(Ext.Date.parse(date));
    }

    // get current date before clearing time
    var d = date.getDate(),
        hr,
        c;

    // clear time
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    if (date.getDate() !== d) { // account for DST (i.e. day of month changed when setting hour = 0)
        // note: DST adjustments are assumed to occur in multiples of 1 hour (this is almost always the case)
        // refer to http://www.timeanddate.com/time/aboutdst.html for the (rare) exceptions to this rule

        // increment hour until cloned date == current date
        for (hr = 1, c = Ext.Date.add(date, Ext.Date.HOUR, hr); c.getDate() !== d; hr++, c = Ext.Date.add(date, Ext.Date.HOUR, hr));

        date.setDate(d);
        date.setHours(c.getHours());
    }

    return date;
};

/**
 * 增加空值处理。input为空时，返回空。
 * 增加Date类型处理。input为Date时，返回date的复制品
 */
Ext.Date.parse = function (input, format, strict) {
    if (Ext.isEmpty(input)) {
        return input;
    }
    if (input instanceof Date)
        return Ext.Date.clone(input);

    if (Ext.isString(input) && (!format || format.indexOf('H:i:s')) > 0) {
        var datetime = input.split(' '),
            date = datetime[0], time = datetime[1], parts;
        if (date) {
            parts = date.split('-');
            parts[0] = Ext.String.leftPad(parts[0], 4, '0');
            parts[1] = Ext.String.leftPad(parts[1], 2, '0');
            parts[2] = Ext.String.leftPad(parts[2], 2, '0');
            datetime[0] = parts.join('-');
        }
        if (time) {
            parts = time.split(':');
            parts[0] = Ext.String.leftPad(parts[0], 2, '0');
            parts[1] = Ext.String.leftPad(parts[1], 2, '0');
            parts[2] = Ext.String.leftPad(parts[2], 2, '0');
            datetime[1] = parts.join(':');
        }
        input = datetime.join(' ');
    }

    if (format) {
        var p = Ext.Date.parseFunctions;
        if (p[format] == null) {
            Ext.Date.createParser(format);
        }

        return p[format].call(Ext.Date, input, Ext.isDefined(strict) ? strict : Ext.Date.useStrict);
    }

    var value;
    if (input) {
        Ext.Array.each(Ext.Date.altFormats.split('|'), function (format) {
            value = Ext.Date.parse(input, format, strict);
            return !value;
        });
    }
    return value;
};

/**
 * Checks if a date falls on or between the given start and end dates.
 * @param {Date/String} date The date to check
 * @param {Date/String} start Start date
 * @param {Date/String} end End date
 * @param {String} [format] 格式化，如果输入日期为字符串，可以先进行格式化后再比较
 * @return {Boolean} `true` if this date falls on or between the given start and end dates.
 */
Ext.Date.between = function (date, start, end, format) {
    if (!date) {
        return false;
    }

    date = Ext.Date.parse(date, format);
    start = Ext.Date.parse(start, format);
    end = Ext.Date.parse(end, format);

    var t = date.getTime();
    if (!!start && start.getTime() > t) {
        return false;
    }
    if (!!end && t > end.getTime()) {
        return false;
    }
    return true;
};