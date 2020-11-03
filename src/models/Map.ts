import { Loadable } from './Loadable'
import { ObjectDrawable } from './view/ObjectDrawable'

export class Map implements Loadable, ObjectDrawable {

  imageUrl: string 
  imageData: ImageData | null = null
  width = 0
  height = 0

  constructor (imagePath: string) {
    this.imageUrl = `${document.location.protocol}//${document.location.host}${imagePath}`
  }

  load () {
    return new Promise<void>((resolve, reject) => {
      const img = document.createElement('img')

      img.onload = () => {
        this.width = img.width
        this.height = img.height
        this.imageData = this.createImageDataFrom(img)

        resolve()
      }
      img.onerror = () => reject(new Error(`Failed to load image ${this.imageUrl}`))
      img.src = this.imageUrl
    })
  }

  getColorAt(x: number, y: number) {
    if (this.imageData !== null) {
      const position = ((y * this.width) + x) * 4
      return this.imageData?.data.slice(position, position + 4)
        .reduce((rgba, color) => {
          const colorHex = color.toString(16)
          return `${rgba}${colorHex.length === 1 ? '0' : ''}${colorHex}`
        }, '#')
    } else {
      return '#00000000'
    }
  }

  private createImageDataFrom (image: HTMLImageElement) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = image.width
    canvas.height = image.height
    context?.drawImage(image, 0, 0)
    return context?.getImageData(0, 0, image.width, image.height) ?? null
  }
}

// function Mapa(jogo, imgMapa) {
// 	if (!(typeof imgMapa == 'string'))
// 		throw new Error('A imagem do mapa (\'imgMapa\') não é uma string');
// 	if (!(jogo instanceof Jogo))
// 		throw new Error('O parametro \'jogo\' não é valido');

// 	let imgCache = jogo.game.cache.getImage(imgMapa);
// 	let altImg = imgCache.height;
// 	let larImg = imgCache.width;

// 	this.bitmap = jogo.game.make.bitmapData(larImg, altImg);
// 	this.bitmap.draw(imgCache, 0, 0);
// 	this.bitmap.update();

// 	this.largura = larImg;
// 	this.altura = altImg;
// }

// Mapa.prototype.obterCorPos = function (x, y) {
// 	// let posX = parseInt(x);
// 	// if (posX < 0 || posX >= mapa.largura) {
// 	// 	return null;
// 	// }
// 	// let posY = parseInt(y);
// 	// if (posY < 0 || posY >= mapa.altura) {
// 	// 	return null;
// 	// }
// 	// return mapa.bitmap.getPixelRGB(posX, posY).color;
// }
