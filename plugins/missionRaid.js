class Raid {
  constructor() {
    this.clear();
  }

  clear = () => {
    this.started = false;
    this.reward = { fragmentScroll: {}, fragmentGear: {} };
    this.stop = false;
    this.count = 0;
  };

  missionRaid = async (param) => {
    this.id = param.id;
    this.times = param.times;
    this.started = true;
    if (!!this.id) {
      const missionRaidCall = {
        calls: [
          {
            name: "missionRaid",
            args: {
              id: this.id,
              times: 1,
            },
            ident: "body",
          },
        ],
      };
      //this.cost = lib.data.mission[this.id].normalMode.cost.stamina;

      let r = await Send(missionRaidCall).then(
        x => {
					if (x.error) {
						console.log(x.error);
						this.started = false;
						return;
					}
					return x.results[0].result.response
				});


      if (!!r[0].fragmentGear) {
        let g = Object.keys(r[0].fragmentGear);
        g.forEach((key) => {
          if (this.reward.fragmentGear[key]) {
            this.reward.fragmentGear[key] += r[0].fragmentGear[key];
          } else {
            this.reward.fragmentGear[key] = r[0].fragmentGear[key];
          }
        });
      }
      if (!!r[0].fragmentScroll) {
        let g = Object.keys(r[0].fragmentScroll);
        g.forEach(async (key) => {
          if (this.reward.fragmentScroll[key]) {
            this.reward.fragmentScroll[key] += r[0].fragmentScroll[key];
          } else {
            this.reward.fragmentScroll[key] = r[0].fragmentScroll[key];
          }
        });
      }

      this.count++;
      let src = this.logRewards();
      if (this.count < this.times && !this.stop) {
        setProgress(
          `<img src=${src} /><br>${I18N("MISSIONS_PASSED")}: ${this.count}/${
            this.times
          } (${I18N("STOP")})`,
          false,
          () => {
            this.stop = true;
          }
        );
        setTimeout(this.missionRaid, 100, param);
      } else {
        setProgress();
        this.clear();
        await popup.confirm(
          `<img src=${src} /><br>${I18N("COMPLETED")}<br>${I18N(
            "REPETITIONS"
          )}: ${this.count}`,
          [
            {
              msg: "Ok",
              result: true,
            },
          ]
        );
      }
    }
  };

  logRewards = () => {
    //Object.entries(reward.fragmentScroll).forEach(([id, count]) => console.log(cheats.translate(`LIB_SCROLL_NAME_${id}`), count));
    //Object.entries(reward.fragmentGear).forEach(([id, count]) => console.log(cheats.translate(`LIB_GEAR_NAME_${id}`), count));

    let g = document.createElement("canvas");
    let ctx = g.getContext("2d");
    g.width =
      56 *
      (Object.keys(this.reward.fragmentGear).length +
        Object.keys(this.reward.fragmentScroll).length);
    g.height = 56;
    let i = 0;

    ["gear", "scroll"].forEach((type) => {
      const fragment =
        this.reward[`fragment${type.charAt(0).toUpperCase() + type.slice(1)}`];
      Object.keys(fragment).forEach((gk) => {
        const item = lib.data.inventoryItem[type][gk];

        let im;
        if (type === "gear") {
          im =
            window.XXX.cachedImages.get(
              `gear_icons_05.xml/${item.assetTexture}`
            ) ??
            window.XXX.cachedImages.get(
              `gear_icons_2_05.xml/${item.assetTexture}`
            );
        } else {
          im = window.XXX.cachedImages.get(
            `scroll_icons.xml/${item.assetTexture}`
          );
        }
        ctx.drawImage(
          im.image,
          im.x,
          im.y,
          im.width,
          im.height,
          56 * i + 3,
          3,
          50,
          50
        );

        const b = window.XXX.cachedImages.get(
          `dialog_basic.rsx/${
            lib.data.enum.itemColor[item.color].fragmentFrameAssetTexture
          }`
        );
        ctx.drawImage(b.image, b.x, b.y, b.width, b.height, 56 * i, 0, 56, 56);

        ctx.font = "bold 16px Sans Serif";
        ctx.textAlign = "end";
        ctx.fillStyle = "rgba(25, 14, 8, 0.8)";
        const m = ctx.measureText(fragment[gk]).width;
        ctx.fillRect(54 * (i + 1) - m - 12, 36, m + 8, 14);

        ctx.font = "bold 16px Sans Serif";
        ctx.textAlign = "end";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "#F2E84A";
        ctx.fillText(fragment[gk], 54 * (i + 1) - 4, 51);

        i++;
      });
    });

    return g.toDataURL();
  };
}

const isChecked = (key) => {
  return document.querySelector(
    `.scriptMenu_Details .scriptMenu_checkbox[data-name='${key}']`
  ).checked;
};

function setProgress(text, hide, onclick) {
  scriptMenu.setStatus(text, onclick);
  hide = hide || false;
  if (hide) {
    hideProgress(3000);
  }
}
function hideProgress(timeout) {
  timeout = timeout || 0;
  clearTimeout(hideTimeoutProgress);
  hideTimeoutProgress = setTimeout(function () {
    scriptMenu.setStatus("");
  }, timeout);
}

const raid = new Raid();

const injectFunction = async (data) => {
  if (data.times == 1 && !raid.started) {
    if (isChecked("repeatMission") && isChecked("countControl")) {
      const result = +(await popup.confirm(I18N("MSG_SPECIFY_QUANT"), [
        {
          msg: I18N("BTN_RUN"),
          isInput: true,
          default: data.times,
        },
      ]));

      if (result > 0) {
        setTimeout(raid.missionRaid, 100, { ...data, times: result });
      }
    }
  }
};

document.addEventListener("HWDataEvent", function(event) {
  if (event.detail.type == 'missionRaid') {
    injectFunction(event.detail.data)
  }
});

export default null;
