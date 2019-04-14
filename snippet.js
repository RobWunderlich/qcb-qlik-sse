
console.log(sortList('fe, zd, ab'))
function sortList (arg) {
    let s = arg.split(",")
    let m = s.map((x)=>x.trim())
     m.sort()
    return m.join(", ")
}
var str = 'OrderId,\n'
str += 'OrderDate,\n'
str += 'CustomerId'

var x = str.split(",\n").join("\n,")
console.log(x)

console.log(str)