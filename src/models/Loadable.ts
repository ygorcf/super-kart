export abstract class Loadable {
  loaded = false

  protected abstract onLoad (): Promise<void>;

  async load() {
    await this.onLoad()
    this.loaded = true
  }
}
