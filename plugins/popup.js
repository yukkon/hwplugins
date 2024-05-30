"use strict";

const injectFunction = () => {
  const div = document.createElement("div");
  div.className = "scriptMenu_button";
  div.innerHTML = '<div class="scriptMenu_buttonText">Остров</div>';
  div.addEventListener("click", async () => {
    const b = document.querySelector(".PopUp_back");

    const r = b.querySelector(".PopUp_");
    r.classList.add("PopUp_hideBlock");

    const container = document.createElement("div");
    container.className = "PopUpn_";
    b.appendChild(container);

    // #region 
    let g = document.createElement("canvas");
		let ctx = g.getContext("2d")

    const x = XX.cachedImages.get(`dialog_season_adventure_tiles.rsx/bg_season_1400_box`);
    ctx.drawImage(x.image, x.x, x.y, x.width, x.height, 0, 0, x.width, x.height);
    let src = g.toDataURL();
    // #endregion

    container.innerHTML =
      `<div style='background-image: url(${src});background-size:100% 100%; overflow:hidden;'><canvas class='dragme' id='hexagonCanvas' style='border: 1px solid black; position: relative;'></canvas></div>`;

    b.classList.remove("PopUp_hideBlock");

    let button = document.createElement("div");
    button.classList.add("pp_close");
    container.append(button);
    button.addEventListener("click", () => {
      b.classList.add("PopUp_hideBlock");
      b.removeChild(container);
    });

    const canvas = document.getElementById("hexagonCanvas");

    const levels = Object.values(lib.data.seasonAdventure.level).filter((s) => s.season == 3)

    const processed = await Send(`{"calls":[{"name":"seasonAdventure_getMapState","args":{"seasonAdventureId": 3},"ident":"body"}]}`).then(r => r.results[0].result.response.levels).then(arr => arr.filter(l => l.steps.length > 0).reduce((acc, v) => {acc[v.id] = v.steps[0].isProcessed; return acc}, {}));

    const map = Array(levels.length)
      .fill()
      .reduce((acc, val, i) => {
        acc[i + 1] = {
          q: lib.data.seasonAdventure.list[3].map.cells[i * 2],
          r: lib.data.seasonAdventure.list[3].map.cells[i * 2 + 1],
        };
        return acc;
      }, {});
    const ar = levels
      .filter(s => s.clientData.graphics.tile != "hex_empty")
      .map(el => ({
        ...map[el.level],
        processed: processed[el.level],
        tile: el.clientData.graphics.tile,
        visible: el.clientData.graphics.visible[0],
        reward: el.steps.map(s => Object.keys(s.reward).map(r => ({k:r, v:s.reward[r]}))).flat(),
      }));

    //levels.filter(s => s.clientData.graphics.tile != "hex_empty")
    //.map(l => l.steps.map(s => Object.keys(s.reward).map(r => ({k:r, v:s.reward[r]})))).flat()

    let a = new A(canvas, ar);
    a.drawBoard();

    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (!a.drawing) {
        a.drawing = true;
        a.drawBoard(e.deltaY > 0 ? a.sideLength + 10 : a.sideLength - 10);
        a.drawing = false;
      }
    });

    canvas.onmousedown = (e) => {
      var targ = e.target ? e.target : e.srcElement;
    
      if (targ.className != 'dragme') {
        return
      };
      targ.style.cursor = 'move';
    
      // assign default values for top and left properties
      if (!targ.style.left) {
        targ.style.left = '0px'
      };
      if (!targ.style.top) {
        targ.style.top = '0px'
      };
    
      const offset = {x: e.clientX, y: e.clientY};
      const coord = {x: parseInt(targ.style.left), y: parseInt(targ.style.top)}
      window.drag = true;
    
      // move div element
      document.onmousemove = (e) => { ((e, offset, coord) => {
        if (!window.drag) {
          return
        };
        if (!e) {
          var e = window.event
        };
        var targ = e.target ? e.target : e.srcElement;
        // move div element
        targ.style.left = coord.x + e.clientX - offset.x + 'px';
        targ.style.top = coord.y + e.clientY - offset.y + 'px';
        return false;
      })(e, offset, coord) };

      e.stopPropagation();
    };

    canvas.onmouseup = (e) => {
      (e.target ? e.target : e.srcElement).style.cursor = 'default';
      window.drag = false;
      e.stopPropagation();
    };

    canvas.onclick = (e) => { 
      if (!window.drag) {
        console.log(a)
      }
    }
  });

  document.querySelector(".main_menu").appendChild(div);
};

class A {
  constructor(canvas, array) {
    this.canvas = canvas;
    if (canvas.getContext) {
      this.ctx = canvas.getContext("2d");
      this.ctx.fillStyle = "#008000"; //8AA639
      this.ctx.strokeStyle = "#333333";
      this.ctx.lineWidth = 2;
    }
    this.array = array;
    let qs = array.map((h) => h.q);
    let rs = array.map((h) => h.r);

    // рры борда, колво ячеек по оси q и по оси r
    this.boardWidth = Math.max(...qs) - Math.min(...qs);
    this.boardHeight = Math.max(...rs) - Math.min(...rs);
    this.offset = { q: Math.min(...qs), r: Math.max(...rs) };

    console.log(this.offset);
  }

  drawBoard(size = 40) {
    if (size < 40 || size >= 120) {
      return;
    }
    this.sideLength = size;

    //рры прясоугольника для гекса
    this.hexRect = {
      w: this.sideLength / 2,
      h: (Math.sqrt(3) * this.sideLength) / 2,
    };

    let qs = this.array.map((h) => h.q);
    let rs = this.array.map((h) => h.r);

    // рры борда, колво ячеек по оси q и по оси r
    this.boardWidth = Math.max(...qs) - Math.min(...qs);
    this.boardHeight = Math.max(...rs) - Math.min(...rs);

    this.canvas.width = this.ctx.width =
      3 * this.boardWidth * this.hexRect.w + 6 * this.hexRect.w;
    this.canvas.height = this.ctx.height =
      2 * this.boardHeight * this.hexRect.h;

    this.offset = { q: Math.min(...qs), r: Math.max(...rs) };
    console.log(this.offset);

    this.array.forEach((el) => {
      this.drawHexagon(el);
    });
  }

  drawHexagon(el) {
    const q = el.q - this.offset.q;
    const r = this.offset.r - el.r;

    const x = 6 * this.hexRect.w + 3 * this.hexRect.w * (q - 1);
    const y = 2 * this.hexRect.h * (r - 1) + (q - this.offset.r) * this.hexRect.h;
    //console.log(q, r);
    //console.log(x, y);
    this.ctx.beginPath();
    this.ctx.moveTo(x - this.hexRect.w, y - this.hexRect.h);
    this.ctx.lineTo(x + this.hexRect.w, y - this.hexRect.h);
    this.ctx.lineTo(x + 2 * this.hexRect.w, y);
    this.ctx.lineTo(x + this.hexRect.w, y + this.hexRect.h);
    this.ctx.lineTo(x - this.hexRect.w, y + this.hexRect.h);
    this.ctx.lineTo(x - 2 * this.hexRect.w, y);
    this.ctx.closePath();

    this.drawReward(x, y, el);
  }

  drawReward(x, y, el) {
    if (el?.tile === "tile_grass_1") {
      if (el.processed) {
        this.ctx.fillStyle = "#000000";
      } else {
        this.ctx.fillStyle = "#8AA639";
      }
      this.ctx.fill();

      //let im = window.XX.cachedImages.get(`dialog_season_adventure_tiles.rsx/tile_grass_1_image`)
      //this.ctx.drawImage(im.image, im.x, im.y, im.width, im.height, x-this.sideLength/2, y-this.sideLength/2, 2*this.sideLength, 2*this.sideLength);
    }

    if (el?.reward?.length > 0) {
      let i = 0;
      let c = el?.reward?.length;
      let h = 2.3 * this.hexRect.w; //люўій размер стороны под награды

      el.reward.forEach(({k:type, v}) => {
        let im, id, value, item, fragment = false;
        if (["starmoney", "gold"].includes(type)) {
          item = Object.values(lib.data.inventoryItem.pseudo).find((e) => e.constName === type.toUpperCase() || e.constName === 'COIN')
          value = v;
          im = XX.cachedImages.get(`${lib.data.asset.inventory[item?.assetAtlas].atlas}/${item?.assetTexture}`);
        } else {
          if (['scrollFragment', 'fragmentGear'].includes(type)) {
            fragment = true;
            type = type.toLowerCase().replace('fragment','')
          }
          [id, value] = Object.entries(v)[0];
          const items = lib.data.inventoryItem[type];
          item = !!items && id in items ? items[id] : null;

          if (!!item) {
            im = XX.cachedImages.get(`${lib.data.asset.inventory[item?.assetAtlas].atlas}/${item?.assetTexture}`);
          }
          
          if (type === "petGear") {
            im = XX.cachedImages.get(`pet_gear.rsx/${item?.assetTexture}`);
          } else if (type === "banner") {
            im = XX.cachedImages.get(`banner_icons.rsx/${item?.assetTexture}`);
          }
        }
        if (!!im) {
          let rect = {x: x-h/2+(i*h/c), y: y-h/(2*c), w:h/c, h:Math.ceil(this.hexRect.w/c)+4};
          if (el.processed) {
            this.ctx.filter = 'grayscale(1)';
          }
          this.ctx.drawImage(
            im.image,
            im.x,
            im.y,
            im.width,
            im.height,
            rect.x,
            rect.y,
            rect.w,
            rect.w
          );

          let b = XX.cachedImages.get(`dialog_basic.rsx/${lib.data.enum.itemColor[5].frameAssetTexture}`);
          if (!!item?.color) {
            let a = 'frameAssetTexture'
            if (fragment) {
              a = 'fragmentFrameAssetTexture'
            }
            b = XX.cachedImages.get(`dialog_basic.rsx/${lib.data.enum.itemColor[item.color][a]}`);
          } 
          this.ctx.drawImage(b.image, b.x, b.y, b.width, b.height, rect.x-4, rect.y-4, rect.w+8, rect.w+8);

          //this.ctx.fillStyle = '#160A02';
          //this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

          this.ctx.font = `bold ${Math.ceil(this.hexRect.w)}px Sans Serif`;
          this.ctx.textAlign = "center";
          this.ctx.fillStyle = "#F2E84A";
          let mm = Intl.NumberFormat('en-US', {notation: "compact", maximumFractionDigits: 2}).format(value);
          this.ctx.fillText(mm, rect.x+(rect.w/2), rect.y+2*rect.h);
          this.ctx.filter = 'none';
        }
        i++
      })
    } else {
        if (!!el?.visible) {
          let im = window.XX.cachedImages.get(
            `dialog_season_adventure_tiles.rsx/${el?.visible}_image`
          );
          this.ctx.drawImage(
            im.image,
            im.x,
            im.y,
            im.width,
            im.height,
            x - 0.9 * this.sideLength,
            y - 0.9 * this.sideLength,
            1.8 * this.sideLength,
            1.8 * this.sideLength
          );
        }
      }
  }
}

export default injectFunction;
