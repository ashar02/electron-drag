var tryRequire = require('try-require')
var $ = require('dombo')

var remote = tryRequire('@electron/remote')

var mouseConstructor = tryRequire('osx-mouse') || tryRequire('win-mouse')

var supported = !!mouseConstructor
var noop = function () { return noop }
var windowWidth = 0
var windowHeight = 0

var drag = function (element, width, height) {
  element = $(element)
  windowWidth = width
  windowHeight = height

  var offset = null
  var mouse = mouseConstructor()

  var onmousedown = function (e) {
    offset = [e.clientX, e.clientY]
  }

  element.on('mousedown', onmousedown)

  mouse.on('left-drag', function (x, y) {
    if (!offset) return

    const pos = remote.screen.getCursorScreenPoint()
    x = Math.round(pos.x - offset[0])
    y = Math.round(pos.y - offset[1])

    remote.getCurrentWindow().setBounds({width: windowWidth, height: windowHeight, x: x, y: y})
  })

  mouse.on('left-up', function () {
    offset = null
    windowWidth = 0
    windowHeight = 0
  })

  return function () {
    element.off('mousedown', onmousedown)
    mouse.destroy()
  }
}

drag.supported = supported
module.exports = supported ? drag : noop
