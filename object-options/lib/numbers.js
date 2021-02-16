exports = module.exports = function init(____0) {

    let numbers = [{
            n: 1,
            i0: {
                ar: 'واحد'
            },
            i1: {
                ar: 'عشرة'
            },
            i2: {
                ar: 'مائة'
            },
            i3: {
                ar: 'الف'
            }
        },
        {
            n: 2,
            i0: {
                ar: 'اثنان'
            },
            i1: {
                ar: 'عشرون'
            },
            i2: {
                ar: 'مائتان'
            },
            i3: {
                ar: 'الفان'
            }
        },
        {
            n: 3,
            i0: {
                ar: 'ثلاثة'
            },
            i1: {
                ar: 'ثلاثون'
            },
            i2: {
                ar: 'ثلاثمائة'
            },
            i3: {
                ar: 'ثلاث الاف'
            }
        },
        {
            n: 4,
            i0: {
                ar: 'اربعة'
            },
            i1: {
                ar: 'اربعون'
            },
            i2: {
                ar: 'اربعة مائة'
            },
            i3: {
                ar: 'اربعة الاف'
            }
        },
        {
            n: 5,
            i0: {
                ar: 'خمسة'
            },
            i1: {
                ar: 'خمسون'
            },
            i2: {
                ar: 'خمسمائة'
            },
            i3: {
                ar: 'خمسة الاف'
            }
        },
        {
            n: 6,
            i0: {
                ar: 'ستة'
            },
            i1: {
                ar: 'ستون'
            },
            i2: {
                ar: 'ستة مائة'
            },
            i3: {
                ar: 'ستة الااف'
            }
        },
        {
            n: 7,
            i0: {
                ar: 'سبعة'
            },
            i1: {
                ar: 'سبعون'
            },
            i2: {
                ar: 'سبعمائة'
            },
            i3: {
                ar: 'سبعة الااف'
            }
        },
        {
            n: 8,
            i0: {
                ar: 'ثمانية'
            },
            i1: {
                ar: 'ثمانون'
            },
            i2: {
                ar: 'ثمانمائة'
            },
            i3: {
                ar: 'ثمان الااف'
            }
        },
        {
            n: 9,
            i0: {
                ar: 'تسعة'
            },
            i1: {
                ar: 'تسعون'
            },
            i2: {
                ar: 'تسعمائة'
            },
            i3: {
                ar: 'تسعة الااف'
            }
        },
        {
            n: 11,
            i0: {
                ar: 'احدى عشر'
            }
        },
        {
            n: 12,
            i0: {
                ar: 'اثنى عشر'
            }
        }
    ]
    let strings = {
        'and' : {
            ar: 'و'
        },
        'space' : {
            ar: ' '
        },
        '10' : {
            ar: 'الااف'
        },
        '20' : {
            ar: 'الف'
        }
    }

    function get1num(num, lang) {
        let s = ''
        numbers.forEach(n => {
            if (n.n == num) {
                s = n.i0[lang]
            }
        })
        return s
    }

    function get2num(num, lang) {
        let s = ''
        if (num == 11) {
            numbers.forEach(n => {
                if (n.n == num) {
                    s = n.i0[lang]
                }
            })
        } else if (num == 12) {
            numbers.forEach(n => {
                if (n.n == num) {
                    s = n.i0[lang]
                }
            })

        } else {
            numbers.forEach(n => {
                if (n.n == num[1]) {
                    s = n.i0[lang]
                }
            })
            numbers.forEach(n => {
                if (n.n == num[0]) {
                    if (num[1] > 0 && num[0] > 1) {
                        s += strings['and'][lang]
                    } else {
                        s += ' '
                    }
                    s += n.i1[lang]
                }
            })
        }
        return s
    }

    function get3num(num, lang) {
        let s = ''
        numbers.forEach(n => {
            if (n.n == num[0]) {
                s = n.i2[lang]
            }
        })
        let n2 = get2num(num.substring(1), lang)
        if (n2) {
            if(s){
                s += strings['and'][lang]
            }
            s += n2
        }
        return s
    }

    function get4num(num, lang) {
        let s = ''
        numbers.forEach(n => {
            if (n.n == num[0]) {
                s = n.i3[lang]
            }
        })
        let n3 = get3num(num.substring(1), lang)
        if (n3) {
            if(s){
                s += strings['and'][lang]
            }
            s += n3
        }
        return s
    }
    ____0.stringfiy = function (num, lang) {
        lang = lang || 'ar'
        num = num.toString()
        let s = ''
        if (num.length == 1) {
            s = get1num(num, lang)
        } else if (num.length == 2) {
            s = get2num(num, lang)
        } else if (num.length == 3) {
            s = get3num(num, lang)
        } else if (num.length == 4) {
            s = get4num(num, lang)
        } else if (num.length == 5) {
            s = get2num(num.substring(0, 2), lang)
            if (num[0] == 1) {
                s += strings['10'][lang] + strings['space'][lang]
            } else {
                s += strings['20'][lang]+ strings['space'][lang]
            }
            let n3 = get3num(num.substring(2), lang)
            if(n3){
                s += strings['and'][lang] + n3
            }
            
        }
        return s
    }
}