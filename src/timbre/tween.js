/**
 * timbre/tween
 */
"use strict";

var timbre = require("../timbre");
// __BEGIN__


var Tween = (function() {
    var Tween = function() {
        initialize.apply(this, arguments);
    }, $this = Tween.prototype;
    
    timbre.fn.setPrototypeOf.call($this, "kr-only");
    
    Object.defineProperty($this, "type", {
        set: function(value) {
            var f;
            if (typeof value === "string") {
                if ((f = Tween.functions[value]) !== undefined) {
                    this._.type = value;
                    this._.func = f;
                }
            }
        },
        get: function() { return this._.type; }
    });
    Object.defineProperty($this, "d", {
        set: function(value) {
            if (typeof value === "number") {
                this._.d = value;
            }
        },
        get: function() { return this._.d; }
    });
    Object.defineProperty($this, "start", {
        set: function(value) {
            if (typeof value === "number") {
                this._.start = value;
            }
        },
        get: function() { return this._.start; }
    });
    Object.defineProperty($this, "stop", {
        set: function(value) {
            if (typeof value === "number") {
                this._.stop = value;
            }
        },
        get: function() { return this._.stop; }
    });
    
    var initialize = function(_args) {
        var type, i, _;
        
        this._ = _ = {};
        
        i = 0;
        if (typeof _args[i] === "string" &&
            (Tween.functions[_args[i]]) !== undefined) {
            type = _args[i++];
        } else {
            type = "linear";
        }
        if (typeof _args[i] === "number") {
            _.d = _args[i++];
        } else {
            _.d = 1000;
        }
        if (typeof _args[i] === "number") {
            _.start = _args[i++];
        } else {
            _.start = 0;
        }
        if (typeof _args[i] === "number") {
            _.stop = _args[i++];
        } else {
            _.stop = 1;
        }
        if (typeof _args[i] === "number") {
            _.mul = _args[i++];
        }
        if (typeof _args[i] === "number") {
            _.add = _args[i++];
        }
        
        _.phase     = 0;
        _.phaseStep = 0;
        _.value     = 0;
        _.ison   = false;
        this.type = type;        
    };
    
    $this.clone = function(deep) {
        var newone, _ = this._;
        var args, i, imax;
        newone = timbre("tween", _.type, _.d, _.start, _.stop);
        newone._.mul = _.mul;
        newone._.add = _.add;
        return newone;
    };
    
    $this.bang = function() {
        var _ = this._;
        var diff;
        diff = _.stop - _.start;
        _.ison   = true;
        _.phase     = 0;
        _.phaseStep = timbre.cellsize / (_.d / 1000 * timbre.samplerate);
        _.value     = _.func(0) * diff + _.start;
        timbre.fn.do_event(this, "on");
        return this;
    };
    
    $this.bang = function() {
        var _ = this._;
        var diff;
        diff = _.stop - _.start;
        _.ison   = true;
        _.phase     = 0;
        _.phaseStep = timbre.cellsize / (_.d / 1000 * timbre.samplerate);
        _.value     = _.func(0) * diff + _.start;
        timbre.fn.do_event(this, "bang");
        return this;
    };
    
    $this.seq = function(seq_id) {
        var _ = this._;
        var cell;
        var value, diff, changed, ended;
        var i, imax;
        
        cell = this.cell;
        if (seq_id !== this.seq_id) {
            if (_.ison) {
                _.phase += _.phaseStep;
                if (_.phase >= 1.0) {
                    _.phase = 1.0;
                    _.ison = false;
                    ended = true;
                } else {
                    ended = false;
                }
                diff = _.stop - _.start;
                _.value = _.func(_.phase) * diff + _.start;
                changed = true;
            } else {
                changed = false;
            }
            value = _.value * _.mul + _.add;
            for (i = 0, imax = timbre.cellsize; i < imax; ++i) {
                cell[i] = value;
            }
            if (changed && this.onchanged) this.onchanged(_.value);
            if (ended) timbre.fn.do_event(this, "ended");
            this.seq_id = seq_id;
        }
        return cell;
    };
    
    return Tween;
}());
timbre.fn.register("tween", Tween);

Tween.functions = {
    "linear": function(k) {
        return k;
    },
    "quadratic.in": function(k) {
        return k * k;
    },
    "quadratic.out": function(k) {
        return k * ( 2 - k );
    },
    "quadratic.inout": function(k) {
		if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
		return - 0.5 * ( --k * ( k - 2 ) - 1 );
    },
    "cubic.in": function(k) {
		return k * k * k;
    },
    "cubic.out": function(k) {
        return --k * k * k + 1;
    },
    "cubic.inout": function(k) {
		if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
		return 0.5 * ( ( k -= 2 ) * k * k + 2 );
    },
    "quartic.in": function(k) {
        return k * k * k * k;
    },
    "quartic.out": function(k) {
		return 1 - --k * k * k * k;
    },
    "quartic.inout": function(k) {
		if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
		return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );
    },
    "quintic.in": function(k) {
        return k * k * k * k * k;
    },
    "quintic.out": function(k) {
		return --k * k * k * k * k + 1;
    },
    "quintic.inout": function(k) {
		if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
		return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );
    },
    "sinusoidal.in": function(k) {
        return 1 - Math.cos( k * Math.PI / 2 );
    },
    "sinusoidal.out": function(k) {
        return Math.sin( k * Math.PI / 2 );
    },
    "sinusoidal.inout": function(k) {
        return 0.5 * ( 1 - Math.cos( Math.PI * k ) );
    },
    "exponential.in": function(k) {
		return k === 0 ? 0 : Math.pow( 1024, k - 1 );
    },
    "exponential.out": function(k) {
		return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );
    },
    "exponential.inout": function(k) {
		if ( k === 0 ) return 0;
		if ( k === 1 ) return 1;
		if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
		return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );
    },
    "circular.in": function(k) {
		return 1 - Math.sqrt( 1 - k * k );
    },
    "circular.out": function(k) {
		return Math.sqrt( 1 - --k * k );
    },
    "circular.inout": function(k) {
		if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
		return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
    },
    "elastic.in": function(k) {
		var s, a = 0.1, p = 0.4;
		if ( k === 0 ) return 0;
		if ( k === 1 ) return 1;
		if ( !a || a < 1 ) { a = 1; s = p / 4; }
		else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
		return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
    },
    "elastic.out": function(k) {
		var s, a = 0.1, p = 0.4;
		if ( k === 0 ) return 0;
		if ( k === 1 ) return 1;
		if ( !a || a < 1 ) { a = 1; s = p / 4; }
		else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
		return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
    },
    "elastic.inout": function(k) {
		var s, a = 0.1, p = 0.4;
		if ( k === 0 ) return 0;
		if ( k === 1 ) return 1;
		if ( !a || a < 1 ) { a = 1; s = p / 4; }
		else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
		if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
		return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
    },
    "back.in": function(k) {
		var s = 1.70158;
		return k * k * ( ( s + 1 ) * k - s );
    },
    "back.out": function(k) {
		var s = 1.70158;
		return --k * k * ( ( s + 1 ) * k + s ) + 1;
    },
    "back.inout": function(k) {
		var s = 1.70158 * 1.525;
		if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
		return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
    },
    "bounce.in": function(k) {
		return 1 - Tween.functions["bounce.out"]( 1 - k );
    },
    "bounce.out": function(k) {
		if ( k < ( 1 / 2.75 ) ) {
			return 7.5625 * k * k;
		} else if ( k < ( 2 / 2.75 ) ) {
			return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
		} else if ( k < ( 2.5 / 2.75 ) ) {
			return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
		} else {
			return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
		}
    },
    "bounce.inout": function(k) {
		if ( k < 0.5 ) return Tween.functions["bounce.in"]( k * 2 ) * 0.5;
		return Tween.functions["bounce.out"]( k * 2 - 1 ) * 0.5 + 0.5;
    },
};

// __END__
describe("tween", function() {
    object_test(Tween, "tween");
});