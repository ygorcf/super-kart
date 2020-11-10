import { ObjectDrawable } from '../ObjectDrawable'
import { Resolution } from '../view/Resolution'
import { View } from '../view/View'
import { Position } from '../Position'

export class Scene {
  context: CanvasRenderingContext2D | null
  position: Position

  constructor (public canvas: HTMLCanvasElement, public resolution: Resolution, private view: View) {
    this.context = canvas.getContext('2d')

    this.canvas.width = resolution.x
    this.canvas.height = resolution.y

    this.position = { x: 0, y: 0 }
  }

  listenKeyboard () {
    window.addEventListener('keydown', evt => {
      if (evt.code === 'ArrowUp') {
        this.position.y -= 2
      }
      if (evt.code === 'ArrowDown') {
        this.position.y += 2
      }
      if (evt.code === 'ArrowLeft') {
        this.position.x -= 2
      }
      if (evt.code === 'ArrowRight') {
        this.position.x += 2
      }
    })

    window.addEventListener('mousewheel', evt => {
      if (evt instanceof WheelEvent) {
        if (evt.deltaY < 0) {
          this.resolution.scale += 0.5
        }
        if (evt.deltaY > 0 && this.resolution.scale > 1) {
          this.resolution.scale -= 0.5
        }
      }
    })
  }

  render () {
    requestAnimationFrame(() => {
      this.clear()
      this.drawCurrentPosition()
      this.render()
    })
  }

  drawCurrentPosition () {
    const objects = this.view.getObjectsAt(
      this.position.x,
      this.position.y,
      this.position.x + (this.resolution.x / this.resolution.scale),
      this.position.y + (this.resolution.y / this.resolution.scale),
    )

    objects.forEach(objectToDraw => {
      const location = objectToDraw.location
      this.drawObjectAt(
        objectToDraw.object,
        location.x - this.position.x,
        location.y - this.position.y
      )
    })
  }

  drawObjectAt (object: ObjectDrawable, x: number, y: number) {
    for (let _y = y; _y < (y + object.height); _y++) {
      for (let _x = x; _x < (x + object.width); _x++) {
        this.drawRectByScale(_x, _y, object.getColorAt(_x - x, _y - y))
      }
    }
  }

  drawRectByScale (x: number, y: number, color: string) {
    this.drawRect(x * this.resolution.scale, y * this.resolution.scale, this.resolution.scale, this.resolution.scale, color)
  }

  drawRect(x: number, y: number, w: number, h: number, color: string) {
    if (this.context !== null) {
      this.context.fillStyle = color
      this.context.fillRect(x, y, w, h)
    }
  }

  clear () {
    this.context?.clearRect(0, 0, this.resolution.x, this.resolution.y)
  }

} 
