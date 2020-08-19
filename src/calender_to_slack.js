/*
    9時, 19時にその日の予定
    23時に次の日の予定
    を slackに投稿する
 */

function setTrigger() {
    let setTime = new Date();
    const current_time = setTime.getHours();

    if (0 <= current_time && current_time < 9) {
        // 基本的にここの処理は通らないはず
        setTime.setHours(9);
        setTime.setMinutes(00);
    } else if (9 <= current_time && current_time < 19) {
        setTime.setHours(19);
        setTime.setMinutes(00);
    } else if (19 <= current_time && current_time < 23) {
        setTime.setHours(23);
        setTime.setMinutes(00);
    } else {
        setTime.setDate(setTime.getDate() + 1)
        setTime.setHours(9);
        setTime.setMinutes(00);
    }

    ScriptApp.newTrigger('main').timeBased().at(setTime).create();
}

function main() {
    setTrigger();

    let post_card_num = 0
    const prop = PropertiesService.getScriptProperties().getProperties();

    // 固定値
    const key   = prop.key;  // SlackAPIキー
    const token = prop.token; // Slackトークン
    const boardid = prop.bord; // TrelloのボードID
    const sheet = SpreadsheetApp.openById(prop.sheet_id); // 出力するスプレットシートのID

    // 前回の読み込みをクリア
    sheet.getSheetByName('output').clear();
    sheet.getSheetByName('list').clear();
    sheet.getSheetByName('target').clear();

    // リスト情報の取得
    const listurl = "https://trello.com/1/boards/" + boardid + "/lists?key=" + key + "&token=" + token + "&fields=name";
    const listres = UrlFetchApp.fetch(listurl);
    const listjson = JSON.parse(listres.getContentText());

    // カード情報の取得
    const apiurl = "https://trello.com/1/boards/"+ boardid +"/cards?key="+ key +"&token="+ token;
    const cardres = UrlFetchApp.fetch(apiurl);
    const cardjson = JSON.parse(cardres.getContentText());

    // Dateオブジェクトの作成
    const today_obj = new Date();

    // 対象の日付を出し分ける用に現在の時間を取得
    const current_time = today_obj.getHours();

    // 今日の日付を取得
    const today_month = ("0"+(today_obj.getMonth() + 1)).slice(-2);
    const today_date = ("0"+today_obj.getDate()).slice(-2);

    // 明日の日付を取得
    today_obj.setDate( today_obj.getDate() + 1 );
    const next_day_month = ("0"+(today_obj.getMonth() + 1)).slice(-2);
    const next_day_date = ("0"+today_obj.getDate()).slice(-2);

    // 対象の日付を検索する時に使用する文字列
    let search_target_string

    // postする時に使用する文字列
    let post_string
    let post_date_string

    if (0 <= current_time && current_time < 23) {
        search_target_string = today_month + '/' + today_date
        post_string = '今日'
    } else {
        search_target_string = next_day_month + '/' + next_day_date
        post_string = '明日'
    }

    // 対象のリストのidを格納する変数
    let target_id

    // リスト情報を「list」シートに出力
    for (i = 0; i < listjson.length; i++) {
        sheet.getSheetByName('list').getRange(i+2,5).setValue(listjson[i]['id']); // リストのID
        sheet.getSheetByName('list').getRange(i+2,6).setValue(listjson[i]['name']); // リストの名前

        // slackにpostする対象の日付と一致したリストのIDを取得
        if (listjson[i]['name'].match(search_target_string)) {
            target_id = listjson[i]['id']
            post_date_string = listjson[i]['name']
        }
    }

    // カード情報を「output」シートに出力
    for (i = 0; i < cardjson.length; i++) { // カード数分ループ
        sheet.getSheetByName('output').getRange(i+2,2).setValue(cardjson[i]['idList']); // カードが所属するリストIDをシートに記載
        sheet.getSheetByName('output').getRange(i+2,3).setValue(cardjson[i]['name']); // カード名をシートに記載
        sheet.getSheetByName('output').getRange(i+2,4).setValue(cardjson[i]['shortUrl']); // カードURLをシートに記載

        // slackにpostする対象の日付のリストにあるカードを「target」シートに出力
        if (cardjson[i]['idList'].match(target_id)) {
            sheet.getSheetByName('target').getRange(post_card_num+2,3).setValue(cardjson[i]['name']); // カード名をシートに記載
            sheet.getSheetByName('target').getRange(post_card_num+2,4).setValue(cardjson[i]['shortUrl']); // カードURLをシートに記載

            post_card_num += 1
        }
    }

    let post_data = ['<!channel>'];

    //メッセージをSlackに送る
    if(post_card_num > 0) {
        post_data.push(post_string + '' + post_date_string + 'の予定だよ！！');
        for (i = 0; i < post_card_num; i++) {
            let cardname = sheet.getSheetByName('target').getRange(i+2,3).getValue(); // カード名
            let cardurl = sheet.getSheetByName('target').getRange(i+2,4).getValue(); // カードURL

            post_data.push('=================\n- カード名：' + cardname +'\n- カードURL：'+ cardurl);
        }
    } else {
        post_data.push(post_string + ' ' + post_date_string + 'の予定はありません！！');
    }

    const sentence = post_data.join('\r\n');
    const payload = {'text' : sentence,};
    const options = {
        'method' : 'post' ,
        'contentType' : 'application/json' ,
        'payload' : JSON.stringify(payload),
        'link_names' : 1,
    };

    // 投稿するwebhookURL
    const url = prop.slack;

    UrlFetchApp.fetch(url, options);
}
