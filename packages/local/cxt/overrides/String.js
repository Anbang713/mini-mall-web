Ext.String.guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

/**
 * Pads the right side of a string with a specified character.  This is especially useful
 * for normalizing number and date strings.  Example usage:
 *
 *     var s = Ext.String.leftPad('123', 5, '0');
 *     // s now contains the string: '12300'
 *
 * @param {String} string The original string.
 * @param {Number} size The total length of the output string.
 * @param {String} [character=' '] (optional) The character with which to pad the original string.
 * @return {String} The padded string.
 */
Ext.String.rightPad = function (string, size, character) {
    var result = String(string);
    character = character || " ";
    while (result.length < size) {
        result = result + character;
    }
    return result;
};

String.prototype.rightPad = function (size, character) {
    var string = '' + this;
    character = character || " ";
    while (string.length < size) {
        string = string + character;
    }
    return string;
};
String.prototype.leftPad = function (size, character) {
    var string = '' + this;
    character = character || " ";
    while (string.length < size) {
        string = character + string;
    }
    return string;
};

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.lastIndexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

if (!String.prototype.repeat) {
    String.prototype.repeat = function (count) {
        'use strict';
        if (this == null) {
            throw new TypeError('can\'t convert ' + this + ' to object');
        }
        var str = '' + this;
        count = +count;
        if (count != count) {
            count = 0;
        }
        if (count < 0) {
            throw new RangeError('repeat count must be non-negative');
        }
        if (count == Infinity) {
            throw new RangeError('repeat count must be less than infinity');
        }
        count = Math.floor(count);
        if (str.length == 0 || count == 0) {
            return '';
        }
        // Ensuring count is a 31-bit integer allows us to heavily optimize the
        // main part. But anyway, most current (August 2014) browsers can't handle
        // strings 1 << 28 chars or longer, so:
        if (str.length * count >= 1 << 28) {
            throw new RangeError('repeat count must not overflow maximum string size');
        }
        var rpt = '';
        for (; ;) {
            if ((count & 1) == 1) {
                rpt += str;
            }
            count >>>= 1;
            if (count == 0) {
                break;
            }
            str += str;
        }
        // Could we try:
        // return Array(count + 1).join(this);
        return rpt;
    };
}

if (!String.prototype.charCount) {
    String.prototype.charCount = function (character) {
        var count = 0,
            index = 0;
        for (; index < this.length; index++) {
            if (this.charAt(index) === character) {
                count++;
            }
        }
        return count;
    };
}
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (pattern, replacement) {
        var target = '' + this,
            source = target;

        do {
            source = target;
            target = source.replace(pattern, replacement);
        } while (source != target);
        return target;
    };
}