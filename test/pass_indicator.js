this.passwordMeter = new PasswordMeter(
    this.inputFields.password.input,
    this.inputFields.password.input.parentElement
    ,this.inputFields.unencryptedUsername.input
);
var PasswordMeter = function(h) {
    return function(f, g, j) {
        var d = h.createElement("div");
        d.setAttribute("class", "meter");
        var e = h.createElement("div");
        d.appendChild(e);
        g ? g.appendChild(d) : f.parentElement.appendChild(d);
        var k = function(b, c) {
            var a = 0;
            if ("" === c && "" === b)
                return 0;
            if (b === c)
                return 1;
            "" !== c && -1 !== c.indexOf(b) && (a -= 15);
            "" != c && -1 !== b.indexOf(c) && (a -= c.length);
            a += b.length;
            0 < b.length && 4 >= b.length ? a += b.length : 5 <= b.length && 7 >= b.length ? a += 6 : 8 <= b.length && 15 >= b.length ? a += 12 : 16 <= b.length && (a += 18);
            b.match(/[a-z]/) && 
            (a += 1);
            b.match(/[A-Z]/) && (a += 5);
            b.match(/\d/) && (a += 5);
            b.match(/.*\d.*\d.*\d/) && (a += 5);
            b.match(/[!,@,#,$,%,^,&,*,?,_,~]/) && (a += 5);
            b.match(/.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~]/) && (a += 5);
            b.match(/(?=.*[a-z])(?=.*[A-Z])/) && (a += 2);
            b.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/) && (a += 2);
            b.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!,@,#,$,%,^,&,*,?,_,~])/) && (a += 2);
            for (var d = {}, f = 0, e = 0, h = b.length; e < h; ++e) {
                var g = b.charAt(e);
                void 0 === d[g] && (d[g] = 1,
                ++f)
            }
            if (1 === f)
                return 2;
            a *= 2;
            0 > a ? a = 0 : 100 < a && (a = 100);
            return a
        }
        ;
        this.updateMeter = function() {
            var b = k(f.value, j ? j.value : "")
              , c = "poor";
            17 > b || (c = 34 > b ? "bad" : 51 > b ? "ok" : 68 > b ? "good" : 85 > b ? "great" : "best");
            e.setAttribute("class", c);
            $(e).css("width", b + "%")
        }
        ;
        LPPlatform.addEventListener(f, "keyup", this.updateMeter);
        this.updateMeter()
    }
}(document);
