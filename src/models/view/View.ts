import { Position } from "../Position"
import { ObjectDrawable } from '../ObjectDrawable'
import { Loadable } from '../Loadable'
import { ViewObject } from './ViewObject'

export class View extends Loadable {
  private objectsPositions: ViewObject[][][] = []
  private objectsToLoad: { object: Loadable & ObjectDrawable, position: Position }[] = []

  addObject (object: ObjectDrawable, position: Position) {
    if (object instanceof Loadable && !object.loaded) {
      this.objectsToLoad.push({ object, position })
    } else {
      this.addObjectLoaded(object, position)
    }
  }

  removeObject (object: ObjectDrawable, position: Position) {
    let objectPosition
    for (let x = position.x; x < object.width; x++) {
      for (let y = position.y; y < object.height; y++) {
        objectPosition = this.objectsPositions[x][y].findIndex(viewObject => viewObject.object === object)
        if (objectPosition > -1) {
          this.objectsPositions[x][y].splice(objectPosition, 1)
        }
      }
    }

    if (object instanceof Loadable && !object.loaded) {
      const i = this.objectsToLoad.findIndex(objectToLoad => objectToLoad.object === object)
      i > -1 && this.objectsToLoad.splice(i, 1)
    }
  }

  getObjectsAt (x: number, y: number, w: number, h: number) {
    const objects: ViewObject[] = []

    for (let _x = x; _x < w; _x++) {
      for (let _y = y; _y < h; _y++) {
        this.objectsPositions[_x]?.[_y] && this.objectsPositions[_x][_y].forEach(object => {
          !objects.find(viewObject => viewObject.isEquals(object)) && objects.push(object)
        })
      }
    }

    return objects
  }

  async onLoad () {
    await Promise.all(this.objectsToLoad.map(async objectTotLoad => {
      await objectTotLoad.object.load()
      this.addObjectLoaded(objectTotLoad.object, objectTotLoad.position)
    }))
  }

  private addObjectLoaded (object: ObjectDrawable, position: Position) {
    for (let x = position.x; x < object.width; x++) {
      for (let y = position.y; y < object.height; y++) {
        if (!this.objectsPositions[x]) {
          this.objectsPositions[x] = []
        }
        if (!this.objectsPositions[x][y]) {
          this.objectsPositions[x][y] = []
        }

        this.objectsPositions[x][y].push(new ViewObject(object, position))
      }
    }
  }
}

// 	Jogo.prototype.desenhaMapa3d = function (mapa, x, y, ang) {
// 		let cor;
// 		let meioy = this.resolucao.y / 2;
// 		let meiox = this.resolucao.x / 2;

// 		for (let i = 0; i < this.resolucao.y; i++) {
// 			// first calculate the distance of the line we are drawing
// 			let distance = ((this.params3d.space_z * this.params3d.scale_y) / (i + this.params3d.horizon));
// 			// then calculate the horizontal scale, or the distance between
// 			// space points on this horizontal line
// 			let horizontal_scale = (distance / this.params3d.scale_x);
// 			// calculate the dx and dy of points in space when we step
// 			// through all points on this line
// 			let line_dx = (-(Math.sin(ang)) * horizontal_scale);
// 			let line_dy = (Math.cos(ang) * horizontal_scale);

// 			// calculate the starting position
// 			let space_x = x + ((this.params3d.distancia_carro + distance) * Math.cos(ang)) - this.resolucao.x/2 * line_dx;
// 			let space_y = y + ((this.params3d.distancia_carro + distance) * Math.sin(ang)) - this.resolucao.x/2 * line_dy;
// 			for (let j = 0; j < this.resolucao.x; j++) {
// 				if (parseInt(space_x) == x && parseInt(space_y) == y)
// 					cor = this.corFora;
// 				else{
// 					cor = mapa.obterCorPos(parseInt(space_x), parseInt(space_y));
// 					if (cor == null) cor = this.corFora;
// 				}
// 				desenhaQuadradoTela(this.graficos, cor, res.scale*j-meiox, res.scale*i-meioy, this.resolucao.escala, this.resolucao.escala);
// 				space_x += line_dx;
// 				space_y += line_dy;
// 			}
// 		}
// 	}
