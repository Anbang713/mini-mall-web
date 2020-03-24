Ext.util.Format.permilSign = '‰';
Ext.util.Format.wan = '万';

Ext.util.Format.myriabit = function (value, formatString) {
    if (isNaN(value) || Ext.isEmpty(value)) {
        return;
    }
    var length = value.toString().split('.')[0].length;
    if (value < 0)
        length--;   // 判断时，需要去掉负号“-”
    if (length <= 4) {
        return Ext.util.Format.number(value, formatString || '0');
    } else if (length <= 8) {
        return Ext.util.Format.number(value / Math.pow(10, 4), formatString || '0') + '万';
    } else if (length <= 12) {
        return Ext.util.Format.number(value / Math.pow(10, 8), formatString || '0') + '亿';
    } else if (length <= 16) {
        return Ext.util.Format.number(value / Math.pow(10, 12), formatString || '0') + '万亿';
    } else {
        return Ext.util.Format.number(value / Math.pow(10, length - 3), formatString || '0') + 'E' + (length - 3);
    }
};

Ext.util.Format.myriabitRenderer = function (formatString) {
    return function (v) {
        return Ext.util.Format.myriabit(v, formatString);
    };
};

Ext.util.Format.percent = function (value, formatString) {
    if (value == undefined || value == null || value === '' || isNaN(value)) {
        return;
    }
    return Ext.util.Format.number(value * 100, formatString || '0') + Ext.util.Format.percentSign;
};

Ext.util.Format.percentRenderer = function (formatString) {
    return function (v) {
        return Ext.util.Format.percent(v, formatString);
    };
};

Ext.util.Format.permil = function (value, formatString) {
    if (value == undefined || value == null || value === '' || isNaN(value)) {
        return;
    }
    return Ext.util.Format.number(value * 1000, formatString || '0') + Ext.util.Format.permilSign;
};

Ext.util.Format.permilRenderer = function (formatString) {
    return function (v) {
        return Ext.util.Format.permil(v, formatString);
    };
};

/******************************************扩展内容**********************************************/
Ext.util.Format.ucn = function (value, emptyText) {
    if (Ext.isEmpty(emptyText)) {
        emptyText = "";
    }
    if (Ext.isEmpty(value)) {
        return emptyText;
    }
    if (Ext.isEmpty(value.code)) {
        return value.name
    }
    if (Ext.isEmpty(value.name)) {
        return '-[' + value.code + ']';
    }
    return value.name + '[' + value.code + ']';
};

/**
 * Returns a ucn rendering function that can be reused to apply a ucn format multiple
 *
 * @return {Function} The ucn formatting function
 */
Ext.util.Format.ucnRenderer = function () {
    return function (v) {
        return Ext.util.Format.ucn(v);
    };
};

/**将Total(total,tax)渲染成total（tax）*/
Ext.util.Format.total = function (total, taxRender) {
    if (!total) {
        return '';
    }
    var text = Ext.util.Format.number(total.total, ',##0.00');
    if (taxRender !== false) {
        text += '(' + Ext.util.Format.number(total.tax, ',##0.00') + ')';
    }
    return text;
};

/**将Total(total,tax)渲染成total（tax）*/
Ext.util.Format.totalRenderer = function (taxRender) {
    return function (v) {
        return Ext.util.Format.total(v, taxRender);
    };
};

Ext.util.Format.taxRate = function (taxRate) {
    if (!taxRate)
        return;

    if (taxRate.name)
        return taxRate.name;

    var caption;
    if (taxRate.taxType == 'excludePrice')caption = '价外税';
    if (taxRate.taxType == 'includePrice')caption = '价内税';

    if (!isNaN(taxRate.rate))
        caption += ' ' + Ext.util.Format.percent(taxRate.rate, '0.##');
    return caption;
};

Ext.util.Format.taxRateRenderer = function () {
    return function (v) {
        return Ext.util.Format.taxRate(v);
    };
};

Ext.util.Format.ratio = function (ratio) {
    if (!ratio)
        return;
    if (ratio['@class'] == 'com.hd123.m3.commons.biz.ratio.NormalRatio') {
        return Ext.util.Format.percent(ratio.rate, '0.####');
    }

    var lines = [];
    if (Ext.isEmpty(ratio.lines))
        return;

    Ext.Array.each(ratio.lines, function (line, index) {
        lines.push({
            low: Ext.util.Format.number(line.low, ',#.00'),
            high: index == ratio.lines.length - 1 ? '∞' : Ext.util.Format.number(line.high, ',#.00'),
            rate: Ext.util.Format.percent(line.rate, ',#.####')
        });
    });
    if (ratio['@class'] == 'com.hd123.m3.commons.biz.ratio.PieceRatio') {
        return Ext.util.Format.list(lines, '<br>', '({low} {high}] {rate}');
    } else {
        return Ext.util.Format.list(lines, '<br>', '{low}元+,{rate}');
    }
};

Ext.util.Format.ratioRenderer = function () {
    return function (v) {
        return Ext.util.Format.ratio(v);
    };
};

Ext.util.Format.direction = function (direction) {
    if (direction < 0 || direction === false)
        return '付';
    if (direction > 0 || direction === true)
        return '收';
};

Ext.util.Format.directionRenderer = function () {
    return function (v) {
        return Ext.util.Format.direction(v);
    };
};

Ext.util.Format.date = function (v, format) {
    var vDate = v;
    if (!v || v.valueOf() == 'NaN' || v.toString() == 'Invalid Date') {
        return "";
    }
    if (!Ext.isDate(v)) {
        vDate = new Date(Date.parse(v));
    }
    if (vDate.toDateString() == 'Invalid Date') {
        vDate = new Date(Ext.Date.parse(v));
        if (vDate.toDateString() == 'Invalid Date') {
            return "";
        }
    }
    return Ext.Date.dateFormat(vDate, format || Ext.Date.defaultFormat);
};

Ext.util.Format.dateRange = function (v, options) {
    if (!v)
        return '';

    options = Ext.valueFrom(options, {});
    Ext.applyIf(options, {
        format: 'Y-m-d',
        beginField: 'beginDate',
        endField: 'endDate'
    });

    return Ext.util.Format.date(v[options['beginField']], options['format'])
        + '～'
        + Ext.util.Format.date(v[options['endField']], options['format']);
};

Ext.util.Format.dateRangeRenderer = function (options) {
    return function (v) {
        return Ext.util.Format.dateRange(v, options);
    };
};

Ext.util.Format.bizState = function (value) {
    if (Ext.isEmpty(value))
        return value;
    if (value === 'using')
        return "使用中";
    if (value === 'deleted')
        return "已删除";
    if (value === 'disabled')
        return "已停用";
    if (value === 'ineffect')
        return "未生效";
    else if (value === 'submit')
        return "已提交";
    else if (value === 'reject')
        return "已驳回";
    else if (value === 'effect')
        return "已生效";
    else if (value === 'reded')
        return "已红冲";
    else if (value === 'finished')
        return "已完成";
    else if (value === 'aborted')
        return "已作废";
    else if (value === 'processing')
        return "进行中";
    else if (value === 'dealing')
        return "处理中";
    else if (value === 'solved')
        return "已解决";
    else if (value === 'repairing')
        return "维修中";
    else if (value === 'audited')
        return "已审核";
    else if (value === 'checked')
        return "已确认";
    else if (value === 'stoped' || value === 'stopped')
        return "已终止";
    return value;
};

/**
 * Returns a bizState rendering function that can be reused to apply a bizState format multiple
 *
 * @return {Function} The bizState formatting function
 */
Ext.util.Format.bizStateRenderer = function () {
    return function (v) {
        return Ext.util.Format.bizState(v);
    };
};

Ext.util.Format.usingState = function (value) {
    if (Ext.isEmpty(value))
        return value;
    if (value === 'using')
        return '使用中';
    else if (value === 'block')
        return '已冻结';
    else if (value === 'disabled')
        return '已停用';
    else if (value === 'deleted')
        return '已删除';
    return value;
};

Ext.util.Format.usingStateRenderer = function () {
    return function (v) {
        return Ext.util.Format.usingState(v);
    };
};

Ext.util.Format.property = function (value, property) {
    if (Ext.isEmpty(value))
        return value;
    return value[property];
};

Ext.util.Format.propertyRenderer = function () {
    return function (v, property) {
        return Ext.util.Format.property(v, property);
    };
};

Ext.util.Format.bool = function (value, emptyText) {
    if (Ext.isEmpty(emptyText)) {
        emptyText = '';
    }
    if (Ext.isEmpty(value)) {
        return emptyText;
    }
    if (value === 'false')
        value = false;
    return !!value ? '是' : '否';
};

Ext.util.Format.boolRenderer = function (emptyText) {
    return function (v) {
        return Ext.util.Format.bool(v, emptyText);
    };
};

Ext.util.Format.operateInfo = function (operateInfo) {
    if (operateInfo == undefined) {
        return '';
    }
    var operator = operateInfo.operator;
    if (operator && operator.fullName) {
        return operateInfo.time + '[' + operator.fullName + ']';
    } else {
        return operateInfo.time
    }
};

Ext.util.Format.operateInfoRenderer = function () {
    return function (v) {
        return Ext.util.Format.operateInfo(v);
    };
};

Ext.util.Format.contract = function (contract, version) {
    if (!contract)
        return;

    Ext.apply(contract, {
        contractId: contract.uuid,
        serialNumber: contract.code,
        signboard: contract.name
    });

    return '<a target="_blank" class="' + Ext.baseCSSPrefix + 'label-link"  href="../invest/index.html#investment.contract?node=view' +
        '&uuid=' + contract['contractId'] +
        (version ? '&version=' + version : '') +
        '">' +
        contract['signboard'] + '[' + contract['serialNumber'] + ']' +
        '</a> ';
};

Ext.util.Format.contractRenderer = function () {
    return function (v) {
        return Ext.util.Format.contract(v);
    };
};

Ext.util.Format.link = function (value) {
    var linkCls = Ext.baseCSSPrefix + 'label-link';
    return '<span class=' + linkCls + '>' + value + '</span>';
};

Ext.util.Format.linkRenderer = function (renderer) {
    if (Ext.isFunction(renderer)) {
        return function (v, metaData, record, rowIndex, colIndex, store, view) {
            return Ext.util.Format.link(renderer(v, metaData, record, rowIndex, colIndex, store, view));
        };
    }
    return function (v) {
        return Ext.util.Format.link(v);
    };
};

/**
 * @param size
 * 文件大小，字节。
 */
Ext.util.Format.size = function (size) {
    if (!Ext.isNumeric(size)) {
        return size;
    }
    size = Ext.Number.from(size);
    if (size < 1024) {
        return size + ' B';
    }
    size = size.divide(1024, 2);
    if (size < 1024) {
        return size + ' KB';
    }
    size = size.divide(1024, 2);
    if (size < 1024) {
        return size + ' MB';
    }
    size = size.divide(1024, 2);
    if (size < 1024) {
        return size + ' GB';
    }
};

Ext.util.Format.sizeRenderer = function () {
    return function (v) {
        return Ext.util.Format.size(v);
    };
};

/**
 * 将list转义成一个字符串。
 * @param {Object[]}value
 *          数组，如果是对象，可以使用tpl进行设置。若干对象是null,将被跳过。
 * @param separator
 *          分隔符
 * @param tpl
 * @returns {string}
 */
Ext.util.Format.list = function (value, separator, tpl) {
    if (Ext.isEmpty(separator)) {
        separator = ';';
    }
    value = Ext.Array.from(value);
    if (!tpl)
        return value.join(separator);

    if (!tpl.isTemplate) {
        tpl = new Ext.XTemplate(tpl);
    }
    var list = [];
    Ext.Array.each(value, function (item) {
        if (Ext.isEmpty(item)) {
            return;
        }
        list.push(tpl.apply(item));
    });
    return list.join(separator);
};

Ext.util.Format.listRenderer = function (separator, tpl) {
    return function (v) {
        return Ext.util.Format.list(v, separator, tpl);
    };
};


Ext.util.Format.cronRenderer = function () {
    return function (v) {
        return Ext.util.Format.cron(v);
    };
};


Ext.util.Format.cron = function (value) {
    if (!value
        || value.indexOf('C') >= 0  // W：表示有效工作日(周一到周五)，暂时不做解释
        || value.indexOf('W') >= 0) // C：根据日历触发，由于使用较少，暂时不做解释
        return value;

    var list = value.split(' '),
        dayOfMonth = list[3],
        dayOfWeek = list[5],
        year = list[6];
    if (list.length != 6 || year) {  // 年，暂不需要。不解析
        return value;
    }
    if (dayOfWeek != '*' && dayOfWeek != '?') {
        if (dayOfMonth != '?') {
            return value;    // 解析不了
        }
    }
    if (dayOfMonth != '*' && dayOfMonth != '?') {
        if (dayOfWeek != '?') {
            return value;  // 解析不了
        }
    }

    var decode = function (value, fieldCaption, decodeWhenZero) {
        var coordinate, specified, increment,
            list = [],
            weekCaptions = ['日', '一', '二', '三', '四', '五', '六'];

        if (value == null || value == undefined) {
            return '';
        } else if (value == 0 && decodeWhenZero !== true && fieldCaption != '时') {
            return '';
        } else if (value === '*' || '?' === value) {
            return '';
        } else if (value.indexOf('/') > -1) {
            coordinate = value.substring(0, value.indexOf('/'));
            if (coordinate === '*') {
                coordinate = 0;
            }
            increment = value.substring(value.indexOf('/') + 1);
            return coordinate == '0' ? ('每' + increment + fieldCaption) : ( decode(coordinate, fieldCaption) + ' 每' + increment + fieldCaption);
        } else if (value.indexOf('-') > -1) {
            value = value.split('-');
            if ('周' === fieldCaption) {
                return '每周' + weekCaptions[value[0] - 1] + '到周' + weekCaptions[value[1] - 1];
            } else {
                return '从' + value[0] + '到' + value[1] + fieldCaption;
            }
        } else if (value.indexOf('L') > -1) {
            coordinate = value.substring(0, value.indexOf('L'));
            if ('' === coordinate) {
                coordinate = '1';
            }
            if ('周' === fieldCaption) {
                return '每月最后一个周' + weekCaptions[coordinate - 1];
            } else {
                return coordinate == '1' ? '最后一日' : ('倒数第' + coordinate + '日');
            }
        } else if (value.indexOf('#') > -1) {
            specified = value.substring(value.indexOf('#') + 1);
            coordinate = value.substring(0, value.indexOf('#')).split(',');
            Ext.Array.each(coordinate, function (v) {
                list.push('周' + weekCaptions[v - 1]);
            });
            return '每月的第' + specified + '个' + list.join(',');
        } else {
            value = value.split(',');
            Ext.Array.each(value, function (v) {
                if ('周' === fieldCaption) {
                    list.push('周' + weekCaptions[v - 1]);
                } else {
                    list.push(v);
                }
            });

            if ('周' === fieldCaption) {
                return '每' + list.join(',');
            } else {
                return list.join() + fieldCaption;
            }
        }
    };

    var sb = [],
        captions = ['秒', '分', '时', '日', '月', '周'];

    Ext.Array.each(list, function (v, index) {
        sb.push(decode(v, captions[index], index > 0 ? sb[index - 1].length > 0 : false));
    });
    if (value.endsWith(' * * * * ?') || value.endsWith(' * * ? * *')) {
        sb.push('每分钟');
    } else if (value.endsWith(' * * * ?') || value.endsWith(' * ? * *')) {
        sb.push('每小时');
    } else if (value.endsWith(' * * ?') || value.endsWith(' ? * *')) {
        sb.push('每日');
    } else if (value.endsWith(' * ?')) {
        sb.push('每月');
    }
    return Ext.Array.reverse(sb).join(' ').trim();
};

Ext.util.Format.mediaFilesRenderer = function () {
    return function (v) {
        return Ext.util.Format.mediaFiles(v);
    };
};

Ext.util.Format.mediaFiles = function (value) {
    if (Ext.isEmpty(value))
        return;
    var html = '',
        isFirst = true;
    // var linkCls = Ext.baseCSSPrefix + 'label-link';
    for (var i = 0, len = value.length; i < len; i++) {
        if (!isFirst)
            html += ',&nbsp;&nbsp;';
        isFirst = false;
        var id = value[i].id,
            name = value[i].name,
            resourcePath = Ext.serviceUrl + 'commons/file/fileGet.hd?fileID=' + id + '&fileName=' + name;
        // html += '<span class=' + linkCls + ' onclick="window.open(\'' + resourcePath + '\')">' + name + '</span>';
        html += ' <a href="' + resourcePath + '" class="' + Ext.baseCSSPrefix + 'label-link">' + name + '</a>';
    }
    return html;
};
