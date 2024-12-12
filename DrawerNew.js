class DrawerNew {
  #canvas;
  #ctx;
  #x;

  constructor(x) {
    this.#x = x;
  }

  get map() {
    /*
    "heroColor": {
      "1": {
        "id": 1,
        "ident": "white",
        "locale_key": "LIB_ENUM_HEROCOLOR_1",
        "skillTierUnlock": 1,
        "heroLevel": 1,
        "frameAssetTexture": "border_hero_white",
        "frameAssetTexture_small": "border_hero_white_small",
        "backgroundAssetTexture": "bg_hero_white",
        "levelBackgroundAssetTexture": "level_white",
        "textColor": "0xB7B0B3",
        "frameAssetTexture_small_pet": "border_pet_white_small",
        "frameAssetTexture_pet": "border_pet_white"
      },*/
    return {
      absolute: "dialog_basic.rsx/ep_star1",
      star: "dialog_basic.rsx/starIcon",
      level_base: "dialog_basic.rsx/level_silver",
      level: (color) =>
        `dialog_basic.rsx/${this.#x.lib.enum.heroColor[color].levelBackgroundAssetTexture}`,
      hero: {
        icon: (id) =>
          `hero_icons_only.xml/${this.#x.lib.hero[id].iconAssetTexture}`,
        border: (color) =>
          `dialog_basic.rsx/${this.#x.lib.enum.heroColor[color].frameAssetTexture_small}`,
        background: (color) =>
          `dialog_basic.rsx/${this.#x.lib.enum.heroColor[color].backgroundAssetTexture}`,
      },
      titan: {
        element: (id) => {
          let e;
          switch (id) {
            case (4000, 4001, 4002, 4003):
              return "dialog_basic.rsx/water";
            case (4010, 4011, 4012, 4013):
              return "dialog_basic.rsx/fire";
            case (4020, 4021, 4022, 4023):
              return "dialog_basic.rsx/earth";
            case (4030, 4031, 4032, 4033):
              return "dialog_basic.rsx/dark";
            case (4040, 4041, 4042, 4043):
              return "dialog_basic.rsx/light";
          }
        },
        icon: (id) => `titan_icons.rsx/titan_icon_${id}`,
        border: (id, el) => {
          if ([4003, 4013, 4023, 4033, 4043].includes(id)) {
            //let el = element(id);
            return `dialog_basic.rsx/border_super_titan_small_${el}`;
          } else {
            return "dialog_basic.rsx/border_titan_small";
          }
        },
        background: (id) => `dialog_basic.rsx/bg_${element(id)}`,
      },
      pet: {
        icon: (id) => `pet_icons.rsx/pet_160_${id}`,
        small: (id) => `pet_icons.rsx/pet_50_${id}`,
        border: (color) =>
          `dialog_basic.rsx/${this.#x.lib.enum.heroColor[color].frameAssetTexture_small_pet}`,
        background: (color) =>
          `dialog_basic.rsx/${this.#x.lib.enum.heroColor[
            color
          ].backgroundAssetTexture.replace("_hero_", "_pet_")}`,
      },
      spirit: {
        level: (level) => {
          switch (true) {
            case level > 80:
              return "dialog_basic.rsx/artifact_lvl_orange";
            case level > 60:
              return "dialog_basic.rsx/artifact_lvl_purple";
            case level > 40:
              return "dialog_basic.rsx/artifact_lvl_blue";
            case level > 20:
              return "dialog_basic.rsx/artifact_lvl_green";
            default:
              return "dialog_basic.rsx/artifact_lvl_white";
          }
        },
        icon: (element) => {
          /*
          switch (element) {
            case "water":
              return "titan_artifact_icons.rsx/spirit_4001";
            case "fire":
              return "titan_artifact_icons.rsx/spirit_4002";
            case "earth":
              return "titan_artifact_icons.rsx/spirit_4003";
            case "light":
              return "titan_artifact_icons.rsx/spirit_4005";
            case "dark":
              return "titan_artifact_icons.rsx/spirit_4004";
          }
          */
          const texture = this.#x.lib.titanArtifact.id.find(x => x.type == 'spirit' && x.element == element).assetTexture;
          return `"titan_artifact_icons.rsx/${texture}`

        },
        border: (level) => {
          /*
          switch (true) {
            case level > 80:
              return "dialog_basic.rsx/artifact_small_orange";
            case level > 60:
              return "dialog_basic.rsx/artifact_small_purple";
            case level > 40:
              return "dialog_basic.rsx/artifact_small_blue";
            case level > 20:
              return "dialog_basic.rsx/artifact_small_green";
            default:
              return "dialog_basic.rsx/artifact_small_white";
          }
          */
          const color = this.#x.lib.titanArtifact.type.spirit.levels[level].color;
          return `dialog_basic.rsx/artifact_small_${color}`;
        },
      },
      banner: {
        icon: (id) => `team_flag_icons.rsx/team_flag_${id}`, // `banner_icons.rsx/banner_${id}`,
        border: "dialog_basic.rsx/bannerFrame_small",
      },
      stone: {
        icon: (id) => `banner_stone_icons.xml/banner_stone_${id}`,
        border: (color) => {
          switch (color) {
            case 1:
              return "dialog_basic.rsx/border_banner_stone_white";
              break;
            case 2:
              return "dialog_basic.rsx/border_banner_stone_green";
              break;
            case 3:
              return "dialog_basic.rsx/border_banner_stone_blue";
              break;
            case 4:
              return "dialog_basic.rsx/border_banner_stone_purple";
              break;
            case 5:
              return "dialog_basic.rsx/border_banner_stone_orange";
              break;
            case 6:
              return "dialog_basic.rsx/border_banner_stone_red";
              break;
            case 7:
              return "dialog_basic.rsx/border_banner_stone_red_absolute";
              break;
          }
        },
      },
      item: {
        border: (color) =>
          `dialog_basic.rsx/${this.#x.lib.enum.itemColor[color].frameAssetTexture}`,
      },
      fragment: {
        border: (color) =>
          `dialog_basic.rsx/${this.#x.lib.enum.itemColor[color].fragmentFrameAssetTexture}`,
      },
    };
  }

  clear() {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  draw(data) {
    let width = (!!data.attackers[0].color) ?
        105 * data.attackers.length +
        (data.pet ? 105 : 0) +
        (data.banner ? 105 : 0)
    : 105 * data.attackers.length + 105 * data.spirit.length;
    let height = 146

    this.#canvas = new OffscreenCanvas(width, height);
    this.#ctx = this.#canvas.getContext("2d");
/*
    if (!!data.attackers[0].color) {
      this.#canvas.width =
        105 * data.attackers.length +
        (data.pet ? 105 : 0) +
        (data.banner ? 105 : 0);
    } else {
      this.#canvas.width =
        105 * data.attackers.length + 105 * data.spirit.length;
    }
    */
    this.#canvas.height = 146;

    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    data.attackers.forEach((a, i) => {
      if (a.color) {
        this.#drawAttacker("hero", a, i, 0 + !!data.pet + !!data.banner);
      } else {
        this.#drawAttacker("titan", a, i, data.spirit.length);
      }
    });
    if (!!data.pet) {
      this.#drawPet(data.pet, 0 + !!data.banner);
    }
    if (!!data.banner) {
      this.#drawBanner(data.banner);
    }
    if (!!data.spirit && data.spirit.length > 0) {
      data.spirit.forEach((a, i) => {
        this.#drawSpirit(a, i);
      });
    }

    return this.#canvas.convertToBlob().then(b => URL.createObjectURL(b))
  }

  #drawAttacker(type, data, i, add) {
    let k, im;
    // bg
    if (type == "hero") {
      k = this.map[type].background(data.color);
      im = this.#x.cachedImages.get(k);

      this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 6 + 105 * (i + add), 10, 80, 80);
    }
    // icon
    k = this.map[type].icon(data.id);
    im = this.#x.cachedImages.get(k);
    this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 7 + 105 * (i + add), 12, 80, 80);
    // border
    if (type == "hero") {
      k = this.map[type].border(data.color);
    } else {
      k = this.map[type].border(data.id, data.element);
    }
    im = this.#x.cachedImages.get(k);
    this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 105 * (i + add), 4, 94, 94);
    // stars
    if (data.star == 6) {
      im = this.#x.cachedImages.get(this.map.absolute);
      this.#ctx.drawImage(
        im.image, im.x, im.y, im.width, im.height,
        9 + 105 * (i + add),
        69,
        im.width + 10,
        im.height
      );
    } else {
      im = this.#x.cachedImages.get(this.map.star);
      [...Array(data.star)].forEach((_, j) => {
        this.#ctx.drawImage(
          im.image, im.x, im.y, im.width, im.height,
          (94 - 17 * data.star) / 2 + 17 * j + 105 * (i + add),
          69,
          20,
          20
        );
      });
    }
    // level border
    if (type == "hero") {
      k = this.map.level(data.color);
    } else {
      k = this.map.level_base;
    }
    im = this.#x.cachedImages.get(k);
    this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 26 + 105 * (i + add), 2, 42, 28);

    // level
    this.#ctx.font = "bold 18px Arial";
    this.#ctx.fillStyle = "white";
    this.#ctx.textAlign = "center";
    this.#ctx.fillText(data.level, 46 + 105 * (i + add), 23);

    // favor
    if (!!data.petId) {
      k = this.map.pet.small(data.petId);
      im = this.#x.cachedImages.get(k);
      this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 68 + 105 * (i + add), 2, 35, 34);
    }
    // power
    this.#ctx.font = "bold 18px Arial";
    this.#ctx.fillStyle = "white";
    this.#ctx.textAlign = "center";
    this.#ctx.fillText(data.power, 48 + 105 * (i + add), 115);

    if (!!data.state) {
      //HP line
      //bg
      this.#ctx.fillStyle = "#0D0805";
      this.#ctx.fillRect(106 * (i + add), 120, 89, 6);

      //bg re
      if (!data.state.isDead) {
        this.#ctx.fillStyle = "#2BC61A";
        this.#ctx.fillRect(
          106 * (i + add),
          120,
          (89 * data.state.hp) / data.state.maxHp,
          6
        );
      }
      //border
      this.#ctx.strokeStyle = "#5D490C"; //3D2711
      this.#ctx.strokeRect(106 * (i + add), 120, 89, 6);
      this.#ctx.fillStyle = "#ffffff";

      // energy
      //bg
      this.#ctx.fillStyle = "#0D0805";
      this.#ctx.fillRect(106 * (i + add), 133, 89, 6);
      // re
      if (!data.state.isDead) {
        this.#ctx.fillStyle = "#EACB0A";
        this.#ctx.fillRect(
          106 * (i + add),
          133,
          (89 * data.state.energy) / 1000,
          6
        );
      }
      this.#ctx.strokeStyle = "#5D490C"; //3D2711
      this.#ctx.strokeRect(106 * (i + add), 133, 89, 6);
      this.#ctx.fillStyle = "#ffffff";
    }
  }

  #drawPet(data, add) {
    // bg
    let k = this.map.pet.background(data.color);
    let im = this.#x.cachedImages.get(k);
    this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 4 + 105 * add, 9, 80, 80);
    // icon
    k = this.map.pet.icon(data.id);
    im = this.#x.cachedImages.get(k);
    if (!!im) {
      this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 7 + 105 * add, 10, 80, 80);
    }
    // border
    k = this.map.pet.border(data.color);
    im = this.#x.cachedImages.get(k);
    this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 105 * add, 4, 94, 94);
    // stars
    if (data.star == 6) {
      im = this.#x.cachedImages.get(this.map.absolute);
      this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 9 + 105 * add, 69, im.width + 10, im.height);
    } else {
      im = this.#x.cachedImages.get(this.map.star);
      [...Array(data.star)].forEach((_, j) => {
        this.#ctx.drawImage(
          im.image, im.x, im.y, im.width, im.height,
          20 + 105 * add + ((47 - 17 * data.star) / 2 + 17 * j),
          69,
          20,
          20
        );
      });
    }
    // level border
    k = this.map.level(data.color);
    im = this.#x.cachedImages.get(k);
    this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 26 + 105 * add, 2, 42, 28);

    // level
    this.#ctx.font = "bold 18px Arial";
    this.#ctx.fillStyle = "white";
    this.#ctx.textAlign = "center";
    this.#ctx.fillText(data.level, 47 + 105 * add, 22);

    // power
    this.#ctx.font = "bold 18px Arial";
    this.#ctx.fillStyle = "white";
    this.#ctx.textAlign = "center";
    if ((data.power || 0) > 0) {
      this.#ctx.fillText(data.power, 47 + 105 * add, 115);
    }
  }

  #drawSpirit(data, i) {
    // icon
    let k = this.map.spirit.icon(data.type);
    let im = this.#x.cachedImages.get(k);

    if (!!im) {
      this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 9 + 105 * i, 12, 80, 80);
    }
    // border
    k = this.map.spirit.border(data.level);
    im = this.#x.cachedImages.get(k);
    this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 6 + 105 * i, 10, 90, 90);
    // stars
    if (data.star == 6) {
      im = this.#x.cachedImages.get(this.map.absolute);
      this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 18 + 105 * i, 69, im.width, im.height);
    } else {
      im = this.#x.cachedImages.get(this.map.star);
      [...Array(data.star)].forEach((_, j) => {
        this.#ctx.drawImage(
          im.image, im.x, im.y, im.width, im.height,
          105 * i + ((105 - 17 * data.star) / 2 + 17 * j),
          69,
          20,
          20
        );
      });
    }
    // level border
    k = this.map.spirit.level(data.level);
    im = this.#x.cachedImages.get(k);
    this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 30 + 105 * i, 2, im.width, im.height);
    // level
    this.#ctx.fillText(data.level, 51 + 105 * i, 23);
  }

  #drawBanner(data) {
    // icon
    let k = this.map.banner.icon(data.id);
    let im = this.#x.cachedImages.get(k);

    if (!!im) {
      this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 9, 12, 80, 80);
    }
    // border
    k = this.map.banner.border;
    im = this.#x.cachedImages.get(k);
    this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 0, 4, 94, 94);

    this.#drawStones(data.slots);
  }

  #drawStones(data) {
    const c = Object.values(data).length;
    Object.values(data).forEach((s, i) => {
      const st = this.#x.lib.inventoryItem.bannerStone[s];
      // icon
      let k = `banner_stone_icons.xml/${st.assetTexture}`;
      let im = this.#x.cachedImages.get(k);

      let x = c + 30 * i + (30 * (3 - c)) / (c + 1);

      if (!!im) {
        this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, x, 80, 30, 30);
      }
      // border
      k = this.map.stone.border(st.color);
      im = this.#x.cachedImages.get(k);
      this.#ctx.drawImage(im.image, im.x, im.y, im.width, im.height, x, 80, 30, 30);
    });
  }
}

export default DrawerNew;