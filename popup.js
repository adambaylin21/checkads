function listenForClicks() {
    document.addEventListener("click", (e) => {

  function startCheck(tabs) {
    document.querySelector("#infoAds").classList.remove("hidden");
    document.querySelector("#infoAds").classList.add("show");

    let gettingItem = browser.storage.local.get(['totalInfo']);
    gettingItem.then((result)=> {
      if (result.totalInfo){
        showTable(result);
      }
      else {
        browser.tabs.sendMessage(tabs[0].id, {
        command: "doCheckAds",
        }).then(showinfo);
      }
    });  
  }

  function resetCheck(tabs) {
    browser.storage.local.remove(['totalInfo']);
    
    browser.tabs.sendMessage(tabs[0].id, {
    command: "doCheckAds",
    }).then(showinfo);
  }
  
  if (e.target.classList.contains("checkinfo")) {
    browser.tabs.query({active: true, currentWindow: true})
    .then(startCheck);
  }

  if (e.target.classList.contains("resetinfo")) {
    browser.tabs.query({active: true, currentWindow: true})
    .then(resetCheck);
  }

  });
}

// function onError(error) {
// console.log(`Error: ${error}`);
// }

function showinfo(){
  let gettingItem = browser.storage.local.get(['totalInfo']);
  gettingItem.then(showTable);
}

function showTable(item) {
  var sTable = ''
  $.each(item.totalInfo, function(i){
    var templ = '<tr>';

    $.each(item.totalInfo[i], function(j){
      if (j == 4){
        templ = templ + `<td><span>${item.totalInfo[i][4].substring(0, 10)}</span></td>`;
      }
      else {
        templ = templ + `<td><span>${item.totalInfo[i][j]}</span></td>`;
      }
      
    });
    templ = templ + '</tr>';
    sTable = sTable + templ;
  });
  $('#sTable').replaceWith(sTable);
}

browser.tabs.executeScript({file: "checkads.js"})
.then(listenForClicks);