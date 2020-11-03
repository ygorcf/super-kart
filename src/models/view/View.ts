import { Resolution } from "./Resolution"
import { ObjectDrawable } from './ObjectDrawable'

export class View {
  context: CanvasRenderingContext2D | null

  constructor (public canvas: HTMLCanvasElement, public resolution: Resolution) {
    this.context = canvas.getContext('2d')

    this.canvas.width = resolution.x
    this.canvas.height = resolution.y
  }

  drawObject (object: ObjectDrawable) {
    for (let y = 0; y < object.height; y++) {
      for (let x = 0; x < object.width; x++) {
        this.drawRectByScale(x, y, object.getColorAt(x, y))
      }
    }
  }

  drawRectByScale (x: number, y: number, color: string) {
    this.drawRect(x, y, this.resolution.scale, this.resolution.scale, color)
  }

  drawRect(x: number, y: number, w: number, h: number, color: string) {
    if (this.context !== null) {
      this.context.fillStyle = color
      this.context.fillRect(x, y, w, h)
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
