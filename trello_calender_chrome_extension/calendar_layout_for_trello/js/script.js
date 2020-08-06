window.onload = function () {

    // 今日の日付
    let date = new Date();
    let this_month = ("0"+(date.getMonth() + 1)).slice(-2);
    let today = ("0"+date.getDate()).slice(-2);

    // ヘッダーの取得
    let header_of_header = document.getElementsByClassName('list-header-name');

    for(let i = 0; i < header_of_header.length; i++) {
        if(header_of_header[i].innerHTML.match(this_month + '/' + today)) {
            header_of_header[i].closest('.list').classList.add('is-today');
        }
    }
}
