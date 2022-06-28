var tryRequire = require('try-require')
var $ = require('dombo')

var remote = tryRequire('@electron/remote')

var mouseConstructor = tryRequire('osx-mouse') || tryRequire('win-mouse')

var supported = !!mouseConstructor
var noop = function () { return noop }

var drag = function (element) {
  element = $(element)

  var offset = null
  var isResizable = null
  var size = null
  var mouse = mouseConstructor()

  var onmousedown = function (e) {
    offset = [e.clientX, e.clientY]
    size = remote.getCurrentWindow().getSize()
    isResizable = remote.getCurrentWindow().isResizable()
    if (isResizable) {
      remote.getCurrentWindow().setResizable(false)
    }
  }

  element.on('mousedown', onmousedown)

  mouse.on('left-drag', function (x, y) {
    if (!offset) return

    const pos = remote.screen.getCursorScreenPoint()
    x = Math.round(pos.x - offset[0])
    y = Math.round(pos.y - offset[1])

    if (size) {
      remote.getCurrentWindow().setBounds({width: size[0], height: size[1], x: x, y: y})
    }
  })

  mouse.on('left-up', function () {
    offset = null
    size = null
    if (isResizable) {
      remote.getCurrentWindow().setResizable(true)
    }
    isResizable = null
  })

  return function () {
    element.off('mousedown', onmousedown)
    mouse.destroy()
  }
}

drag.supported = supported
module.exports = supported ? drag : noop
