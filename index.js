/*

browserify client.js | browserify-paths2ids > client.bundle.js

*/

#!/usr/bin/env node

var through = require('through')
var split = require('split')

var idsI = 1
var ids = {}

var reA = /(.*require\s*\(\s*[\"\'])(\w+)([\"\']\s*\).*)/
var reB = /^(\}\,)(\{.+\})(\]\,\d+\:\[function\(require\,module\,exports\)\{)$/

module.exports = function(){return through(write,end)}
    
if (!module.parent) {
  var tStream = through(write, end)
  process.stdin.resume()
  process.stdin.pipe(split()).pipe(tStream).pipe(process.stdout)
}

function write(d) {
  if (reA.test(d)) {
    var r = reA.exec(d)
    if (!ids[r[2]]) ids[r[2]] = (idsI++).toString(16)
    //console.error('---- A:',d,'-->',r[1]+ids[r[2]]+r[3])
    d = r[1]+ids[r[2]]+r[3]
  }
  else if (reB.test(d)) {
    var r = reB.exec(d)
    var s = JSON.parse(r[2])
    var f = {}
    Object.keys(s).forEach(function(k){
      if (!ids[k]) ids[k] = (idsI++).toString(16)
      f[ids[k]] = s[k]
    })
    //console.error('---- B:',d,'-->',r[1]+JSON.stringify(f)+r[3])
    d = r[1]+JSON.stringify(f)+r[3]
  }
  this.queue(d+'\n')
}

function end() {
  //console.error(ids)
  this.queue(null)
}
