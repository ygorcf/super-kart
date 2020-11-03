export interface ObjectDrawable {
  width: number
  height: number

  getColorAt(x: number, y: number): string
}
