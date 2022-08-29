import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Update } from '../libs/update';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { EdgesGeometry } from 'three/src/geometries/EdgesGeometry';
import { PointLight } from 'three/src/lights/PointLight';
import { Scroller } from "../core/scroller";
import { Tween } from "../core/tween";
import { Conf } from "../core/conf";
import { Util } from "../libs/util";
import { Item } from "./item";
import { Color } from "three";

export class Visual extends Canvas {

  private _con:Object3D;
  private _item:Array<Item> = [];
  private _scrollItem:Array<Item> = [];
  private _bgColor:Color = new Color()

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D();
    this.mainScene.add(this._con);

    const light = new PointLight(new Color(Util.instance.random(0, 1), Util.instance.random(0, 1), Util.instance.random(0, 1)), 1);
    this.mainScene.add(light)
    light.position.x = Func.instance.sw() * 0;
    light.position.y = Func.instance.sh() * 0;
    light.position.z = Func.instance.sh() * 1;

    this._bgColor = light.color.clone();

    const geo = new BoxGeometry(1,1,1);
    const edgeGeo = new EdgesGeometry(geo)

    for(let i = 0; i < Conf.instance.HIT_ITEM_NUM; i++) {
      const item = new Item({
        geo:geo,
        con:this._con,
        edgeGeo:edgeGeo,
        isScroll:false,
      });
      this._con.add(item);
      this._item.push(item);
    }

    for(let i = 0; i < 1; i++) {
      const si = new Item({
        geo:geo,
        edgeGeo:edgeGeo,
        isScroll:true,
      });
      this._con.add(si);
      this._scrollItem.push(si);
    }

    Scroller.instance.set(0);
    this._resize()
  }


  protected _update(): void {
    super._update()

    // const sw = Func.instance.sw()
    const sh = Func.instance.sh()

    const scroll = Scroller.instance.val.y;
    const scrollArea = sh * 2;

    Tween.instance.set(document.querySelector('.l-height'), {
      height:scrollArea
    })

    this._scrollItem.forEach((val) => {
      val.position.x = 0;
      val.position.y = Util.instance.map(scroll, -(scrollArea - sh * 1.25), sh * 0.75, 0, scrollArea - sh);

      // const testX = val.position.x;
      const testY = val.position.y;

      this._item.forEach((val) => {
        // const dx = testX - val.position.x;
        // const dy = testY - val.position.y;
        // const d = Math.sqrt(dx * dx + dy * dy);

        // 影響力
        // const r = Util.instance.map(d, 0, 1, 200, 0);

        const kake = 2;
        const v = (val.position.y - testY) * kake;
        // if(i == 0) console.log(v)
        val.setScrollVal(v);
      })

    })

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this.renderer.setClearColor(this._bgColor, 1)
    this.renderer.render(this.mainScene, this.camera)
  }


  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    const itemSize = h / this._item.length
    this._item.forEach((val,i) => {
      val.position.y = (h / this._item.length) * -i + h * 0.5 - itemSize * 0.5
    })

    this.renderSize.width = w;
    this.renderSize.height = h;

    this.updateCamera(this.camera, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }
}
