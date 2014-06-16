(function(){

var ret =
    '(\\$(?:(?:' +
        '\\$' +
      ')|(?:' +
        '<[^>]*>' +
      ')|(?:' +
        '{[^}]*}' +
      ')|(?:' +
        '[0-9]+' +
      ')|(?:' +
        '_' +
      ')|(?:' +
        '[a-zA-Z_]+\\w' +
    ')))';
var re = new RegExp(ret,'g');

function get(args, index, underscore) {
    if (args.length == 0) {
	throw "No arguments for $ substitution";
    }
    if (typeof(index) == 'string' && /^[0-9]*$/.test(index)) {
	index = parseInt(index,10);
    }
    if (index == '_') {
	index = underscore[0]++;
    }
    if (typeof(index) == 'number') {
	if (index >= args.length) {
	    throw "Not enough arguments (have "+args.length+" want "+(index+1);
	}
	return args[index];
    }
    if (index in args[0]) {
	return args[0][index];
    }
    throw "Unmatched $ substitution '" + index + "'";
}
	
String.prototype.$ = function() {
    var pieces = this.split(re);
    var us = [0];
    for (i in pieces) {
	try {
	    if (pieces[i] == '' || pieces[i][0]!='$') {
		continue;
	    } else if (pieces[i] == '$$') {
		pieces[i] = '$';
	    } else if (pieces[i][1] == '{') {
		pieces[i] = get(arguments, pieces[i].slice(2,-1), us);
	    } else if (pieces[i][1] == '<') {
		var subpieces = pieces[i].slice(2,-1).split(':');
		var f;
		if (subpieces.length == 1) {
		    f = String.prototype.$.formatters.html;
		} else {
		    var fn = subpieces.shift();
		    if (fn in String.prototype.$.formatters) {
			f = String.prototype.$.formatters[fn];
		    } else {
			throw "unknown formatter '" + fn + "'";
		    }
		}
		subpieces.unshift(get(arguments, subpieces.pop(), us));
		pieces[i] = f.apply(null,subpieces);
	    } else {
		pieces[i] = get(arguments, pieces[i].slice(1), us);
	    }
	} catch (e) {
	    if (String.prototype.$.throwOnError) {
		throw e;
	    } else {
		pieces[i] = '{{{' + e + '}}}';
	    }
	}
    }
    return pieces.join('');
};

String.prototype.$.throwOnError = false;

String.prototype.$.formatters = {
    html: function(str) {
	return str.replace(/&/g,'&amp').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    },
    sf: function(num,d) {
	if (typeof(num) != 'number') {
	    return num;
	}
	if (typeof(d) == 'undefined') {
	    d=2;
	}
	if (typeof(d) == 'string') {
	    d=parseInt(d);
	}
	var digits = Math.floor(Math.log(num)/Math.log(10))+1;
	if (digits >= d) {
	    return Math.round(num);
	}
	num += 5 * Math.pow(10, digits-d-1); // Since we're truncating, not rounding, catch round-ups
	if (digits > 1) {
	    return num.toString().substr(0,d);
	} else if (digits == 1) {
	    return num.toString().substr(0,d+1);
	} else {
	    return num.toString().substr(0,2+d-digits);
	}
    },
    si: function(num,b,d) {
	var base;
	var prefixes = ['f', 'p', 'n', '\u03bc', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'H'];
	var prefixnul = prefixes.indexOf('');
	if (typeof(num) != 'number') {
	    return num;
	}
	if (typeof(b)=='undefined' || b==10 || b==1000) {
	    base=1000;
	} else if (b==2 || b==1024) {
	    base=1024;
	} else {
	    throw 'unrecognized base for si: '+b;
	}
	var offset = Math.ceil(Math.log(num)/Math.log(base));
	if (prefixnul+offset-1 >= prefixes.length) {
	    offset = prefixes.length-prefixnul;
	}
	if (prefixnul+offset-1 < 0) {
	    offset = 1-prefixnul;
	}
	num *= Math.pow(base,1-offset);
	var s = String.prototype.$.formatters.sf(num,d);
	s += prefixes[prefixnul+offset-1];
	if (base==1024 && offset!=1) {
	    s += 'i';
	}
	return s;
    },
    h: function(num) {
	if (typeof(num) != 'number') {
	    num=parseFloat(num);
	}
	return num.toString(16);
    },
    H: function(num) {
	if (typeof(num) != 'number') {
	    num=parseFloat(num);
	}
	return num.toString(16).toUpperCase();
    }
};

})();