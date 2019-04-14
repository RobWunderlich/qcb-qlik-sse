
console.log(sortList('John, Zack, Aaron'))
function sortList (arg, sep=',') {
    // let s = arg.split(sep)
    // let m = s.map((x)=>x.trim())
    //  m.sort()
    // return m.join(sep)
    return arg.split(sep).map((x)=>x.trim()).sort().join(sep)
}

console.log('Hello World'.split("").reverse().join(""))
