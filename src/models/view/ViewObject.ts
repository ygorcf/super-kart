import { ObjectDrawable } from '../ObjectDrawable'
import { Position } from '../Position'
import { Location } from '../Location'

export class ViewObject {
  constructor (public object: ObjectDrawable, public viewPosition: Position) {}

  get location () {
    return new Location(
      this.viewPosition.x,
      this.viewPosition.y,
      this.viewPosition.x + this.object.width,
      this.viewPosition.y + this.object.height
    )
  }

  isEquals(object: ViewObject) {
    return this.object === object.object
  }
}
