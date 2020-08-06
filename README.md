# Trello calender tools

## 概要

３機能を格納したリポジトリです

- Trelloのレイアウトをカレンダー化 - css, js
- Trelloにカレンダーな日付リストを生成 - php
- Slackへ１日３回定期的にリマインダーを送信 - GAS


## Trelloのレイアウトをカレンダー化

`trello_calender_chrome_extension/calendar_layout_for_trello` をまるっと
chromeの拡張機能として使用

`calender-default-{任意の文字列}` `calender-mini-{任意の文字列}` なボードがカレンダーなレイアウトになる  
読み込んだ時点でのその日の日付リストが光る  

## Trelloにカレンダーな日付リストを生成

`src/calender_maker.php` で生成される

- `.env.template` を `.env` な名前で複製
- `composer install` を実行
- `src/` に移動して `php calender_maker.php` を実行

## Slackへ１日３回定期的にリマインダーを送信

`src/calender_to_slack.js` をスプレッドシートのスクリプトエディタでGASとして使用  
9am, 7pm → その日の日付リストに入っているカードがSlackに送信される  
23pm → 次の日の日付リストに入っているカードがSlackに送信される  

- `list` `output` `target` な３シートが存在するスプレッドシートを作成
- スクリプトエディタでプロジェクトのプロパティを指定
- `src/calender_to_slack.js` をスクリプトエディタに貼り付けて１度だけ実行  

以後 自動でトリガーが設定され定期実行される
