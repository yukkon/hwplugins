'use strict';

const injectFunction = async () => {
  const div = document.createElement('div');
  div.className = 'scriptMenu_button'
  div.innerHTML = '<div class="scriptMenu_buttonText">my-script</div>';
  div.addEventListener("click", async () => {
/*
    let a = await Send({calls:[{name:"adventure_find",args:{},ident:"group_1_body"}]}).then(r => r.results[0].result.response.lobbies);
    
    {name:"adventure_getLobbyInfo",args: {id: 13332916 },ident: "body" }

    {
      "result": {
          "response": {
              "adventureId": "13",
              "mapIdent": "adv_valley_3pl_hell",
              "users": {
                  "12868420": {
                      turnsLeft: 13,
                      user.name: ""
                      }
                  }
              }
          }
      }
  }

    {name:"adventure_getLobbyInfo",args: {id: 13332916 },ident: "body" }
*/
    console.log(a);
    alert("my-script plugin button");
/*
    function getTabId() {  }
    function getTitle() { return document.title; }

chrome.scripting
    .executeScript({
      target : {tabId : getTabId(), allFrames : true},
      func : getTitle,
    })
    .then(injectionResults => {
      for (const {frameId, result} of injectionResults) {
        console.log(`Frame ${frameId} result:`, result);
      }
    });
*/
  });

/*
  function getTabId() {  }
  const css = "body { background-color: red; }";

  chrome.scripting.insertCSS({target : {tabId : getTabId()}, css : css }).then(() => console.log("CSS injected"));
*/
  document.querySelector('.scriptMenu_main').appendChild(div);
}
/*
document.addEventListener("HWDataEvent", function(event) {
  console.log("my-script HWDataEvent handled: ", event);
});
*/
export default injectFunction;