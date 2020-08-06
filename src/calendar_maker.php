<?php

require_once '../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable('../');
$dotenv->load();

// 固定値
$key = $_ENV ['TRELLO_KEY'];
$token = $_ENV ['TRELLO_TOKEN'];

// ____ １：ボード情報の取得 ____
$bords_url = 'https://trello.com/1/members/yamamoto_minako/boards?key=' . $key . '&token=' . $token . '&fields=name';

// cURLセッションを初期化
$ch = curl_init();

//オプション
curl_setopt($ch, CURLOPT_URL, $bords_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// ボードの情報を取得
$bord_list =  curl_exec($ch);

// 取得結果を表示
echo json_encode(json_decode($bord_list), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// セッションを終了
curl_close($ch);

// ____ ２：カレンダーを生成するボードを選択（ボードを間違えるとめんどくさいから標準入力から都度受け取る事にした） ____
echo 'カレンダーを生成したいボードのIDはどれですか: ';
$bord_id = trim(fgets(STDIN));

// ____ ３：カレンダー情報の生成 ____
// １ヶ月分の日付の取得
$period_object = new DatePeriod(
    // 来月の月始まりだよと宣言
    new DateTime('first day of next month'),
    // 1日毎の日付データを取得
    new DateInterval('P1D'),
    // ２ヶ月後までの日付を取得(２ヶ月後の表示はされない)
    new DateTime('first day of +2 month')
);

// 曜日を日本語に変換するための要素
$week = ['日', '月', '火', '水', '木', '金', '土'];

// １ヶ月分の日付を配列に格納（reverseさせたいので一旦ここで配列にした）
$period_map = [];
foreach ($period_object as $day) {
    $period_map[] = $day->format('m/d') . '（' . $week[$day->format('w')] . '）';
}

// POSTされる時に最終日からPOSTして欲しいのでreverse（objectをreverseさせる方法ないの？）
$period_post_data = array_reverse($period_map);

// ____ ４：POST用データ作成, POST ____
// POSTするURL
$url = 'https://trello.com/1/lists';

foreach ($period_post_data as $date_name) {
    $post_data = [
        'key'     => $key,
        'token'   => $token,
        'name'    => $date_name,
        'idBoard' => $bord_id
    ];

    // cURLセッションを初期化
    $ch = curl_init();

    // オプションを設定
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);

    // URLの情報を取得
    $response =  curl_exec($ch);

    // 取得結果を表示
    echo json_encode(json_decode($response), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    // セッションを終了
    curl_close($ch);
}
