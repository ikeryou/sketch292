import { MyObject3D } from "../webgl/myObject3D";
import { Mesh } from 'three/src/objects/Mesh';
import { LineSegments } from 'three/src/objects/LineSegments';
import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial';
import { Color } from 'three/src/math/Color';
import { Val } from '../libs/val';
import { Tween } from '../core/tween';
import { Util } from "../libs/util";
import { Scroller } from "../core/scroller";
import { DoubleSide } from 'three/src/constants';
import { Func } from "../core/func";
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { Conf } from "../core/conf";
import { Object3D } from 'three/src/core/Object3D';

export class Item extends MyObject3D {

  private _mesh:Mesh;
  private _line:LineSegments;
  private _shakeVal:Val = new Val();
  private _oldAng:number = -90;
  private _isScroll:boolean = false;
  private _con:Object3D;

  constructor(opt:any = {}) {
    super()

    this._con = opt.con;
    this._isScroll = opt.isScroll;

    this._mesh = new Mesh(
      opt.geo,
      new MeshPhongMaterial({
        color:new Color(Util.instance.random(0, 1), Util.instance.random(0, 1), Util.instance.random(0, 1)),
        emissive: new Color(Util.instance.random(0, 1), Util.instance.random(0, 1), Util.instance.random(0, 1)),
        depthTest:!this._isScroll,
        side:DoubleSide,
      }),
    );
    this.add(this._mesh);

    this._line = new LineSegments(
      opt.edgeGeo,
      new LineBasicMaterial({
        color:0x000000,
        depthTest:false,
        side:DoubleSide,
      })
    )
    this.add(this._line);

    if(this._isScroll) {
    } else {
      this._mesh.position.z = 0.5;
      this._line.position.z = 0.5;
    }
  }


  public setScrollVal(v:number):void {
    const ang = Util.instance.clamp(v, -90, 90);
    this.rotation.x = Util.instance.radian(ang);

    if(this._oldAng != ang && Math.abs(ang) == 90) {
      this._shake();
    }

    this._oldAng = ang;
  }


  private _shake():void {

    Tween.instance.a(this._shakeVal, {
      val:[0, 1]
    }, 0.1, 0, null, null, () => {
      let range = 0.1;
      // this._mesh.position.x = Util.instance.range(range);
      this._mesh.position.y = Util.instance.range(range);
      this._mesh.position.z = 0.5 + Util.instance.range(range);

      range = 1;
      this._con.position.x = Util.instance.range(range);
      this._con.position.y = Util.instance.range(range);
      this._con.position.z = Util.instance.range(range * 2);
    }, () => {
      this._mesh.position.x = 0;
      this._mesh.position.y = 0;
      this._mesh.position.z = 0.5;

      this._con.position.x = this._con.position.y = this._con.position.z = 0;
    })
  }


  protected _update():void {
    super._update();

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();
    const itemSize = (sh / Conf.instance.HIT_ITEM_NUM) * 0.5;

    if(this._isScroll) {
      const s = Scroller.instance.val.y;

      this.rotation.x = Util.instance.radian(s * -2);
      // this.rotation.y = Util.instance.radian(s * -0.78);
      // this.rotation.z = Util.instance.radian(s * 0.92);

      // this.position.z = itemSize * 5;

      // const size = sw * Func.instance.val(0.4, 0.25)
      // this.scale.set(size, 50, sw * 0.1);
      this.scale.set(sw * 0.5, 20, itemSize - 10)
    } else {
      this.scale.set(sw * 0.5, 20, itemSize - 10);
    }

    this._line.position.copy(this._mesh.position)
  }


  protected _resize(): void {
    super._resize();
  }
}