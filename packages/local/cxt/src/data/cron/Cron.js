/**
 * cron表达式
 *
 * Created by Rvljc on 2017/6/20.
 */
Ext.define('Cxt.data.cron.Cron', {
    SECOND: 0,
    MINUTE: 1,
    HOUR: 2,
    DAY_OF_MONTH: 3,
    MONTH: 4,
    DAY_OF_WEEK: 5,
    YEAR: 6,
    ALL_SPEC_INT: 99, // '*'
    NO_SPEC_INT: 98, // '?'
    ALL_SPEC: 99,
    NO_SPEC: 98,

    monthMap: {
        'JAN': 0,
        'FEB': 1,
        'MAR': 2,
        'APR': 3,
        'MAY': 4,
        'JUN': 5,
        'JUL': 6,
        'AUG': 7,
        'SEP': 8,
        'OCT': 9,
        'NOV': 10,
        'DEC': 11
    },
    dayMap: {
        'SUN': 1,
        'MON': 2,
        'TUE': 3,
        'WED': 4,
        'THU': 5,
        'FRI': 6,
        'SAT': 7
    },

    cronExpression: undefined,
    seconds: new Set(),
    minutes: new Set(),
    hours: new Set(),
    daysOfMonth: new Set(),
    months: new Set(),
    daysOfWeek: new Set(),
    years: new Set(),

    lastdayOfWeek: false,
    lastdayOfMonth: false,
    nearestWeekday: false,
    expressionParsed: false,
    nthdayOfWeek: 0,
    lastdayOffset: 0,

    constructor: function (cronExpression) {
        if (Ext.isEmpty(cronExpression)) {
            throw "cronExpression cannot be null";
        }

        this.cronExpression = cronExpression.toUpperCase();
        var list = cronExpression.split(' '),
            SECOND = list[0],
            MINUTE = list[1],
            HOUR = list[2],
            DAY_OF_MONTH = list[3],
            MONTH = list[4],
            DAY_OF_WEEK = list[5];
        if (list.length != 6) {
            throw "cronExpression cannot be analysis";
        }
        if (Ext.isEmpty(SECOND)) {
            throw "seconds cannot be null";
        }
        if (Ext.isEmpty(MINUTE)) {
            throw "minutes cannot be null";
        }
        if (Ext.isEmpty(HOUR)) {
            throw "hours cannot be null";
        }
        if (Ext.isEmpty(DAY_OF_MONTH)) {
            throw "dayOfMonth cannot be null";
        }
        if (Ext.isEmpty(MONTH)) {
            throw "months cannot be null";
        }
        if (Ext.isEmpty(DAY_OF_WEEK)) {
            throw "dayOfWeek cannot be null";
        }

        this.buildExpression(this.cronExpression);
    },

    buildExpression: function (expression) {
        var me = this;
        me.seconds = new Set();
        me.minutes = new Set();
        me.hours = new Set();
        me.daysOfMonth = new Set();
        me.months = new Set();
        me.daysOfWeek = new Set();
        me.years = new Set();

        var exprOn = me.SECOND,
            exprsTok = expression.split(' ');

        for (var i = 0; i < exprsTok.length; i++) {
            var expr = exprsTok[i];
            if (!Ext.isEmpty(expr) && exprOn <= me.YEAR) {   //拆分后一个个遍历   注意判断exprsTok是否存在下一个值是否正确
                if (exprOn == me.DAY_OF_MONTH && expr.indexOf('L') != -1 && expr.length > 1 && expr.indexOf(',') > -1) {
                    throw "Support for specifying 'L' and 'LW' with other days of the month is not implemented";
                }
                if (exprOn == me.DAY_OF_WEEK && expr.indexOf('L') != -1 && expr.length > 1 && expr.indexOf(',') > -1) {
                    throw "Support for specifying 'L' with other days of the week is not implemented";
                }
                if (exprOn == me.DAY_OF_WEEK && expr.indexOf('#') != -1 && expr.indexOf('#', expr.indexOf('#') + 1) != -1) {
                    throw "Support for specifying multiple \"nth\" days is not implemented.";
                }

                var vTok = expr.split(',');
                for (var j = 0; j < vTok.length; j++) {
                    var v = vTok[j];
                    me.storeExpressionVals(0, v, exprOn);
                }
            }
            exprOn++;
        }

        if (exprOn <= me.DAY_OF_WEEK) {
            throw "Unexpected end of expression.";   //表达式的意外结束
        }

        if (exprOn <= me.YEAR) {
            me.storeExpressionVals(0, '*', me.YEAR);
        }

        var dow = me.getSet(me.DAY_OF_WEEK);
        var dom = me.getSet(me.DAY_OF_MONTH);

        var dayOfMSpec = !(dow.has(me.NO_SPEC_INT));
        var dayOfWSpec = !(dom.has(me.NO_SPEC_INT));

        if (!dayOfMSpec || dayOfWSpec) {
            if (!dayOfWSpec || dayOfMSpec) {
                throw  "Support for specifying both a day-of-week AND a day-of-month parameter is not implemented."; // 不支持同时指定一周中的一天和一月中的一天
            }
        }


        return true;

    },

    //对表达式的每一个字符串进行验证
    storeExpressionVals: function (pos, s, type) {
        var me = this,
            incr = 0;
        var i = me.skipWhiteSpace(pos, s);
        if (i >= s.length) {
            return i;
        }
        var c = s.charAt(i);
        //当字符串第一个字符为英文且不是‘L’或者‘W’时----验证MONTH 和 DAY_OF_WEEK
        if ((c >= 'A') && (c <= 'Z') && (!(s === ('L'))) && (!(s === ('LW'))) && (!s.match('^L-[0-9]*[W]?'))) {
            var sub = s.substring(i, i + 3),
                sval = -1,
                eval = -1;
            if (type == me.MONTH) {
                sval = me.monthMap[sub] + 1;
                if (sval <= 0) {
                    throw "Invalid Month value: '" + sub + "'";    //月值无效
                }
                if (s.length > i + 3) {
                    c = s.charAt(i + 3);
                    if (c == '-') {
                        i = i + 4;
                        sub = s.substring(i, i + 3);
                        eval = me.monthMap[sub] + 1;
                        if (eval <= 0) {
                            throw "Invalid Month value: '" + sub + "'";
                        }
                    }
                }
            } else if (type == me.DAY_OF_WEEK) {
                //sval = me.getDayOfWeekNumber(sub);
                sval = me.dayMap[sub];
                if (sval < 0) {
                    throw "Invalid Day-of-Week value: '" + sub + "'";     //无效周日值:
                }
                if (s.length > i + 3) {
                    c = s.charAt(i + 3);
                    if (c == '-') {
                        i = i + 4;
                        sub = s.substring(i, i + 3);
                        sval = me.dayMap[sub];
                        if (eval < 0) {
                            throw "Invalid Day-of-Week value: '" + sub + "'";   //无效周日值:
                        }
                    } else if (c == '#') {
                        i = i + 4;
                        me.nthdayOfWeek = parseInt(s.substring(i));
                        if (nthdayOfWeek < 1 || nthdayOfWeek > 5) {
                            throw "A numeric value between 1 and 5 must follow the '#' option";   //1和5之间的数值必须遵循“#”选项
                        }
                    } else if (c == 'L') {
                        me.lastdayOfWeek = true;
                        i++;
                    }
                }

            } else {
                throw "Illegal characters for this position: '" + sub + "'";    //此位置的非法字符: '
            }

            if (eval != -1) {
                incr = 1;
            }
            me.addToSet(sval, eval, incr, type);
            return (i + 3);
        }

        //当字符串第一个字符为‘？’----验证DAY_OF_MONTH 和 DAY_OF_WEEK
        if (c == '?') {
            i++;
            if ((i + 1) < s.length && (s.charAt(i) != ' ' && s.charAt(i + 1) != '\t')) {
                throw "Illegal character after '?': " + s.charAt(i);   //'?'后的非法字符:
            }

            if (type != me.DAY_OF_WEEK && type != me.DAY_OF_MONTH) {
                throw "'?' can only be specfied for Day-of-Month or Day-of-Week.";   //'?'只能指定一个月或一周中的一天。
            }

            if (type == me.DAY_OF_WEEK && !me.lastdayOfMonth) {

                if (me.daysOfMonth.has(me.NO_SPEC_INT)) {
                    throw "'?' can only be specfied for Day-of-Month -OR- Day-of-Week.";   //'?' 只能指定一个月或一周中的一天。
                }


            }

            me.addToSet(me.NO_SPEC_INT, -1, 0, type);
            return i;
        }

        //当字符串第一个字符为‘*’或者‘/’----验证
        if (c == '*' || c == '/') {
            if (c == '*' && (i + 1) >= s.length) {
                me.addToSet(me.ALL_SPEC_INT, -1, incr, type);
                return i + 1;
            } else if (c == '/' && ((i + 1) >= s.length || s.charAt(i + 1) == ' ' || s.charAt(i + 1) == '\t')) {
                throw "'/' must be followed by an integer.";   // '/' 必须跟随一个整数.
            } else if (c == '*') {
                i++;
            }
            c = s.charAt(i);
            if (c == '/') {
                i++;
                if (i >= s.length) {
                    throw "Unexpected end of string.";  //字符串的意外结束.
                }

                incr = me.getNumericValue(s, i);

                i++;
                if (incr > 10) {
                    i++;
                }
                if (incr > 59 && (type == me.SECOND || type == me.MINUTE)) {
                    throw "Increment > 60 : " + incr;
                } else if (incr > 23 && (type == me.HOUR)) {
                    throw "Increment > 24 : " + incr;
                } else if (incr > 31 && (type == me.DAY_OF_MONTH)) {
                    throw "Increment > 31 : " + incr;
                } else if (incr > 7 && (type == me.DAY_OF_WEEK)) {
                    throw "Increment > 7 : " + incr;
                } else if (incr > 12 && (type == me.MONTH)) {
                    throw "Increment > 12 : " + incr;
                }
            } else {
                incr = 1;
            }

            me.addToSet(me.ALL_SPEC_INT, -1, incr, type);
            return i;
        } else if (c == 'L') {  //当字符串第一个字符为‘L’----验证DAY_OF_MONTH 和 DAY_OF_WEEK
            i++;
            if (type == me.DAY_OF_MONTH) {
                me.lastdayOfMonth = true;
            }
            if (type == me.DAY_OF_WEEK) {
                me.addToSet(7, 7, 0, type);
            }
            if (type == me.DAY_OF_MONTH && s.length > i) {
                c = s.charAt(i);
                if (c == '-') {
                    var vs = me.getValueSet(0, s, i + 1);
                    me.lastdayOffset = vs.value;
                    if (me.lastdayOffset > 30) {
                        throw "Offset from last day must be <= 30";  //最后一天的必须是< = 30
                    }
                    i = vs.pos;
                }

                if (s.length > i) {
                    c = s.charAt(i);
                    if (c == 'W') {
                        me.nearestWeekday = true;
                        i++;
                    }
                }
            }
            return i;
        } else if (c >= '0' && c <= '9') {  //当字符串第一个字符为‘L’----验证
            var val = parseInt(c.valueOf());
            i++;
            if (i >= s.length) {
                me.addToSet(val, -1, -1, type);
            } else {
                c = s.charAt(i);
                if (c >= '0' && c <= '9') {
                    var vs = me.getValueSet(val, s, i);
                    val = vs.value;
                    i = vs.pos;
                }
                i = me.checkNext(i, s, val, type);
                return i;
            }
        } else {
            throw "Unexpected character: " + c;  //意外的字符：
        }
        return i;

    },

    //将表达式的各个时间类型的值保存到相应的Set集合中
    addToSet: function (val, end, incr, type) {
        var me = this,
            set = me.getSet(type);


        //对表达式的不同类型时段的区间进行验证
        if (type == me.SECOND || type == me.MINUTE) {
            if ((val < 0 || val > 59 || end > 59) && (val != me.ALL_SPEC_INT)) {
                throw "Minute and Second values must be between 0 and 59";        //分钟和秒值必须介于0和59之间
            }

        } else if (type == me.HOUR) {
            if ((val < 0 || val > 23 || end > 23) && (val != me.ALL_SPEC_INT)) {
                throw "Hour values must be between 0 and 23";                     //小时值必须介于0和23之间。
            }
        } else if (type == me.DAY_OF_MONTH) {
            if ((val < 1 || val > 31 || end > 31) && (val != me.ALL_SPEC_INT) && (val != me.NO_SPEC_INT)) {
                throw "Day of month values must be between 1 and 31";             //月日值必须介于1和31之间
            }
        } else if (type == me.MONTH) {
            if ((val < 1 || val > 12 || end > 12) && (val != me.ALL_SPEC_INT)) {
                throw "Month values must be between 1 and 12";                    //月值必须介于1和12之间
            }
        } else if (type == me.DAY_OF_WEEK) {
            if ((val == 0 || val > 7 || end > 7) && (val != me.ALL_SPEC_INT) && (val != me.NO_SPEC_INT)) {
                throw "Day-of-Week values must be between 1 and 7";               //周值必须在1到7之间
            }
        }

        if ((incr == 0 || incr == -1) && val != me.ALL_SPEC_INT) {
            if (val != -1) {
                set.add(val);
            } else {
                set.add(me.NO_SPEC_INT);
            }
            return;
        }

        var startAt = val,
            stopAt = end;

        if (val == me.ALL_SPEC_INT && incr <= 0) {
            incr = 1;
            set.add(me.ALL_SPEC_INT);
        }

        if (type == me.SECOND || type == me.MINUTE) {
            if (stopAt == -1) {
                stopAt = 59;
            }
            if (startAt == -1 || startAt == me.ALL_SPEC_INT) {
                startAt = 0;
            }
        } else if (type == me.HOUR) {
            if (stopAt == -1) {
                stopAt = 23;
            }
            if (startAt == -1 || startAt == me.ALL_SPEC_INT) {
                startAt = 0;
            }
        } else if (type == me.DAY_OF_MONTH) {
            if (stopAt == -1) {
                stopAt = 31;
            }
            if (startAt == -1 || startAt == me.ALL_SPEC_INT) {
                startAt = 1;
            }
        } else if (type == me.MONTH) {
            if (stopAt == -1) {
                stopAt = 12;
            }
            if (startAt == -1 || startAt == me.ALL_SPEC_INT) {
                startAt = 1;
            }
        } else if (type == me.DAY_OF_WEEK) {
            if (stopAt == -1) {
                stopAt = 7;
            }
            if (startAt == -1 || startAt == me.ALL_SPEC_INT) {
                startAt = 1;
            }
        } else if (type == me.YEAR) {
            if (stopAt == -1) {
                stopAt = 2070;
            }
            if (startAt == -1 || startAt == me.ALL_SPEC_INT) {
                startAt = 1970;
            }
        }

        var max = -1;
        if (stopAt < startAt) {
            switch (type) {
                case  me.SECOND :
                    max = 60;
                    break;
                case  me.MINUTE :
                    max = 60;
                    break;
                case  me.HOUR :
                    max = 24;
                    break;
                case  me.MONTH :
                    max = 12;
                    break;
                case  me.DAY_OF_WEEK :
                    max = 7;
                    break;
                case  me.DAY_OF_MONTH :
                    max = 31;
                    break;
                case  me.YEAR :
                    throw "Start year must be less than stop year";     //起始年份必须少于停止年份
                default           :
                    throw "Unexpected type encountered";                //遇到意外的类型
            }
            stopAt += max;
        }

        for (var i = startAt; i <= stopAt; i += incr) {
            if (max == -1) {
                set.add(i);
            } else {
                var i2 = i % max;
                if (i2 == 0 && (type == me.MONTH || type == me.DAY_OF_WEEK || type == me.DAY_OF_MONTH)) {
                    i2 = max;
                }
                set.add(i2);
            }
        }


    },

    //当字符串前两位为数字时-----检查后一位的字符为 ‘L’ ‘W’  ‘—’ ‘/’ ‘#’  时的不同情况下的验证
    checkNext: function (pos, s, val, type) {
        var me = this,
            end = -1,
            i = pos;

        if (i >= s.length) {
            me.addToSet(val, end, -1, type);
            return i;
        }

        var c = s.charAt(pos);

        if (c == 'L') {
            if (type = me.DAY_OF_WEEK) {
                if (val < 1 || val > 7) {
                    throw "Day-of-Week values must be between 1 and 7";    // 周值必须在1到7之间。
                    me.lastdayOfWeek = true;
                }
            } else {
                throw "'L' option is not valid here. (pos=" + i + ")";     //'L' 选项在这里无效. (pos=
            }
            var set = me.getSet(type);
            set.add(val);
            i++;
            return i;
        }

        if (c == 'W') {
            if (type == me.DAY_OF_MONTH) {
                me.nearestWeekday = true;
            } else {
                throw "'W' option is not valid here. (pos=" + i + ")";     //'W' 选项在这里无效. (pos=
            }

            if (val > 31) {
                throw "The 'W' option does not make sense with values larger than 31 (max number of days in a month)";  //“W”选项对大于31的值（一个月的最大天数）没有意义。
            }
            var set = me.getSet(type);
            set.add(val);
            i++;
            return i;
        }

        if (c == '#') {
            if (type != me.DAY_OF_WEEK) {
                throw "'#' option is not valid here. (pos=" + i + ")";  //'#' 选项在这里无效. (pos=
            }

            i++;
            me.nthdayOfWeek = parseInt(s.substring(i));
            if (me.nthdayOfWeek < 1 || me.nthdayOfWeek > 5) {
                throw "A numeric value between 1 and 5 must follow the '#' option";   //1和5之间的数值必须遵循“#”选项
            }

            var set = me.getSet(type);
            set.add(val);
            i++;
            return i;
        }

        if (c == '-') {
            i++;
            c = s.charAt(i);
            var v = parseInt(c.valueOf());
            end = v;
            i++;
            if (i >= s.length) {
                me.addToSet(val, end, 1, type);
                return i;
            }
            c = s.charAt(i);
            if (c >= '0' && c <= '9') {
                var vs = me.getValueSet(v, s, i);
                end = vs.value;
                i = vs.pos;
            }

            if (i < s.length && ((c = s.charAt(i)) == '/')) {
                i++;
                c = s.charAt(i);
                var v2 = parseInt(c.valueOf());
                i++;
                if (i >= s.length) {
                    me.addToSet(val, end, v2, type);
                    return i;
                }
                c = s.charAt(i);
                if (c >= '0' && c <= '9') {
                    var vs = me.getValueSet(v2, s, i);
                    var v3 = vs.value;
                    me.addToSet(val, end, v3, type);
                    i = vs.pos;
                    return i;
                } else {
                    me.addToSet(val, end, 1, type);
                    return i;
                }
            } else {
                me.addToSet(val, end, 1, type);
                return i;
            }

        }

        if (c == '/') {
            i++;
            c = s.charAt(i);
            var v2 = parseInt(c.valueOf());
            i++;
            if (i >= s.length) {
                me.addToSet(val, end, v2, type);
                return i;
            }
            c = s.charAt(i);
            if (c >= '0' && c <= '9') {
                var vs = me.getValueSet(v2, s, i);
                var v3 = vs.value;
                me.addToSet(val, end, v3, type);
                i = vs.pos;
                return i;
            } else {
                throw "Unexpected character '" + c + "' after '/'";
            }
        }
        me.addToSet(val, end, 0, type);
        i++;
        return i;

    },

    getNumericValue: function (s, i) {
        var me = this;
        var endOfVal = me.findNextWhiteSpace(i, s),
            val = s.substring(i, endOfVal);
        return parseInt(val);
    },


    //判断空格的数量  默认为0；
    skipWhiteSpace: function (i, s) {
        for (; i < s.length && (s.charAt(i) == ' ' || s.charAt(i) == '\t'); i++) {
            ;
        }
        return i;
    },
    //判断空格的数量  默认为0；
    findNextWhiteSpace: function (i, s) {
        for (; i < s.length && (s.charAt(i) == ' ' || s.charAt(i) == '\t'); i++) {
            ;
        }
        return i;
    },


    //保存表达式不同时间类型的输入值
    getSet: function (type) {
        var me = this;
        switch (type) {
            case me.SECOND:
                return me.seconds;
            case me.MINUTE:
                return me.minutes;
            case me.HOUR:
                return me.hours;
            case me.DAY_OF_MONTH:
                return me.daysOfMonth;
            case me.MONTH:
                return me.months;
            case me.DAY_OF_WEEK:
                return me.daysOfWeek;
            case me.YEAR:
                return me.years;
            default:
                return null;
        }
    },


    //定义一个Val对象 如果表达式某时间类型以数字开头，将数字部分保存到val.value 中
    getValueSet: function (v, s, i) {

        var c = s.charAt(i);
        var s1 = v.toString();
        while (c >= '0' && c <= '9') {
            s1 = s1 + c;
            i++;
            if (i >= s.length) {
                break;
            }
            c = s.charAt(i);
        }

        var val = {
            value: undefined,
            pos: undefined
        };

        val.pos = (i < s.length) ? i : i + 1;
        val.value = parseInt(s1.toString());
        return val;

    }

});