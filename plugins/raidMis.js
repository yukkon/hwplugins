class Raid {
  constructor() {
		this.id = 0;
		this.reward = {fragmentScroll: 0, fragmentGear: 0};
		this.stop = false;
		this.count = 0;
	}

	missionRaid = async (param) => {
		console.log("raidMis.Raid.missionRaid", param);

		const result = await popup.confirm(I18N('MSG_REPEAT_MISSION'), [ 
			{ msg: I18N('BTN_REPEAT'), isInput: true, default: 10},
			{ result: false, isClose: true },
		]);

		console.log("raidMis result", result);
	};
	[
	{
    "fragmentScroll": {
        "147": 1
    },
    "gold": 1986
  },
	{
    "fragmentScroll": {
        "147": 1
    },
    "gold": 1986
	},
	{
    "fragmentScroll": {
        "147": 1,
        "214": 1
    },
    "consumable": {
        "10": 1
    },
    "gold": 1986
  }
	]
}
	
const r = new Raid();

document.addEventListener("HWDataEvent", function(event) {
  //userGetInfo.vipPoints > 10

  //lib.data.mission[param.id].normalMode.cost.stamina
  //Object.values(lib.data.refillable).find(r => r.ident == 'stamina')
  //userGetInfo.refillable.find(r => r.id == stamina.id).amount

  //console.log("raidMission HWDataEvent handled: ", event);
	
  if (event.detail.type == 'missionRaid') {
    //setTimeout(r.missionRaid(), 100, {...event.detail.data, count: 1});
		//setTimeout(missionRaid, 100, {...event.detail.data, count: 1});
  }
  if (event.detail.type == 'call' && event.detail.data.name =='missionRaid') {
    //console.log("call missionRaid: ", event);
		//setTimeout(r.missionRaid, 100, event.detail.data.args);
    //setTimeout(missionRaid, 100, {...event.detail.data, count: 1});
  }
});

export default r;