var tryRequire = require('try-require')
var $ = require('dombo')

var remote = tryRequire('@electron/remote')

var mouseConstructor = tryRequire('osx-mouse') || tryRequire('win-mouse')

var supported = !!mouseConstructor
var noop = function () { return noop }

var offset = null
var isResizable = null
var size = null
var mouse = mouseConstructor()
var curElement = null

mouse.on('left-drag', function (x, y) {
  if (!offset) return

  const pos = remote.screen.getCursorScreenPoint()
  x = Math.round(pos.x - offset[0])
  y = Math.round(pos.y - offset[1])

  if (size) {
    remote.getCurrentWindow().setBounds({x: x, y: y, width: size[0], height: size[1]})
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

var onmousedown = function (e) {
  offset = [e.clientX, e.clientY]
  size = remote.getCurrentWindow().getSize()
  isResizable = remote.getCurrentWindow().isResizable()
  if (isResizable) {
    remote.getCurrentWindow().setResizable(false)
  }
}

var drag = function (element) {
  if (curElement) {
    curElement.off('mousedown', onmousedown)
  }
  curElement = $(element)
  curElement.on('mousedown', onmousedown)

  return function (clearVarsOnly) {
    if (clearVarsOnly) {
      offset = null
      size = null
      if (isResizable) {
        remote.getCurrentWindow().setResizable(true)
      }
      isResizable = null
      return;
    }
    curElement.off('mousedown', onmousedown)
    curElement = null
    mouse.destroy()
  }
}

drag.supported = supported
module.exports = supported ? drag : noop
