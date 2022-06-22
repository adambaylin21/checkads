(function() {
    /**
    * Check and set a global guard variable.
    * If this content script is injected into the same page again,
    * it will do nothing next time.
    */
    if (window.hasRun) {
    return;
    }
    window.hasRun = true;

    browser.runtime.onMessage.addListener((message) => {
    if (message.command === "doCheckAds") {
        generalInfo();

    }

    if (message.command === "test") {
        browser.storage.local.set({
        kitten:  {name:"Mog", eats:"mice"},
        monster: {name:"Kraken", eats:"people"}
        });
    }

    });

})();

function getTokenS(){
    var tokenS;
    $.ajax({
        async: false,
        global: false,
        type: "GET",
        dataType: "html",
        url: "https://business.facebook.com/traffic-analysis/?nav_source=flyout_menu&business_id=505054504589818", 
        success: function(data){
            tokenS = data.substring(
              data.indexOf("[\"EAAS") + 1, 
              data.lastIndexOf(",\"1296932580325048")
            );
            tokenS = tokenS.replace(/['"]+/g, '');
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            return '';
        }

    });
    return tokenS;

}

async function generalInfo(){
    var tokenQ = getTokenQ();
    var info1 = checkAds01(tokenQ);
    var lsTkqc = [];

    $.each(info1, function(i){
        $.each(info1[i],function(j){
            lsTkqc.push(j);
        });
    });

    var tokenS = getTokenS();
    var info2 = [];
    await getInfoAds(0, lsTkqc, tokenS, info2);
    
    var totalInfo = [];
        for (var key in info1) {
            for (var idads in info1[key]){
                var [nameacc, status, utc, datebill, limit, money] = info1[key][idads];
                try {
                    var [currency,balance] = info2[key][idads];
                } catch (error) {
                    var [currency,balance] = [0,0];
                }

        totalInfo.push([idads, nameacc, status, utc, datebill, currency, limit, balance, money]);
      }
    }
    browser.storage.local.set({'totalInfo': totalInfo});
}

function checkAds01(tokenQ){
    var fields = `owner_business,created_time,account_id,next_bill_date,adspaymentcycle,currency,name,adtrust_dsl,
    +account_status,timezone_name,business_country_code,timezone_offset_hours_utc,disable_reason,insights.date_preset(maximum){spend}`
    var urlx = `https://graph.facebook.com/v12.0/me/adaccounts?fields=${fields}&limit=50&access_token=${tokenQ}`;
    var info01 = []; 
    $.ajax({
        async: false,
        global: false,
        type: "GET",
        url: urlx,
        success: function(data){
            $.each(data["data"], function(i) {
                var c = data["data"][i]
                var [account_status, account_id, next_bill_date, name, timezone_offset_hours_utc, adtrust_dsl, currency] = 
                [c.account_status, c.account_id, c.next_bill_date, c.name, c.timezone_offset_hours_utc, c.adtrust_dsl, c.currency];
                
                info01.push({[account_id] : [name, account_status, timezone_offset_hours_utc, next_bill_date, adtrust_dsl,currency]});
            });
            
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            return '';
        }

    });
    return info01;
}

function getTokenQ(){
    var tokenQ;
    $.ajax({
        async: false,
        global: false,
        type: "GET",
        dataType: "text",
        url: "https://www.facebook.com/ajax/bootloader-endpoint/?modules=AdsLWIDescribeCustomersContainer.react", 
        success: function(data){
            tokenQ = data.substring(
              data.indexOf(":\"EAAQ") + 1, 
              data.lastIndexOf(",\"clientID\"")
            );
            tokenQ = tokenQ.replace(/['"]+/g, '');
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            return '';
        }

    });
    return tokenQ;
}

function getLsAcc(token) {
    var lstkqc = [];
    $.ajax({
        async: false,
        global: false,
        type: "GET",
        url: 'https://graph.facebook.com/v12.0/me/adaccounts?access_token=' + token, 
        success: function(data){
            $.each(data['data'], function(i, item) {
                lstkqc.push(data['data'][i].id.replace("act_", ""));
            });
            try { if (Object.values(data['error']).includes('checkpoint') > -1){ return '';}
            } catch(err){}
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            return '';
        }
    });
    return lstkqc;
}

async function getInfoAds(number, lsAccId, tokenS, infoAds){
    for (var i = 0; i < lsAccId.length; i++) {
        var adsId = lsAccId[i]
        $.ajax({
            async: false,
            global: false,
            type: "GET",
            url: `https://graph.facebook.com/graphql?variables={%22paymentAccountID%22:%22${adsId}%22}
            &doc_id=4123775161071594&access_token=${tokenS}&method=post`,
            success: function(data){
                var a = data['data']['billable_account_by_payment_account'];
                var threshold = a['billing_threshold_currency_amount']['formatted_amount_no_symbol'];
                var balance = a['account_balance']['formatted_amount'];
                infoAds.push({[adsId]:[threshold,balance]});
            }
        });
        await pause();
    }

}

function pause() {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, 1500);
  });
}
