var SCREEN_WIDTH = 500;
var SCREEN_HEIGHT = 400;

window.addEventListener('load',init);

var canvas;
var ctx;
var mikanX = 0;
var mikanY = 0;
var click_count=0;
var orb_size =50;
var margin_width = 10;
var margin_height= 10;
var mouseX = 0;
var mouseY = 0;
var cur_mode;
var select_color ="R";
var button_l=false;
var icolor =['R','G','B','Y','P','H','J','D'];
var otirand = [true,true,true,true,true,true,true,true];
var step_count=0;
var isKepri = false;
var boardURL = 0;

function init(){
  canvas = document.getElementById('maincanvas');

  if(document.addEventListener){

    // マウスボタンを押すと実行されるイベント
    document.addEventListener("mousedown" , MouseEventFunc);
    // マウスカーソルを移動するたびに実行されるイベント
    document.addEventListener("mousemove" , MouseEventFunc);
    // マウスボタンを離すと実行されるイベント
    document.addEventListener("mouseup" , MouseEventFunc);
    // コンテキストメニューが表示される直前に実行されるイベント
    document.addEventListener("contextmenu" , MouseEventFunc);

    // アタッチイベントに対応している
  }else if(canvas.attachEvent){

    // マウスボタンを押すと実行されるイベント
    canvas.attachEvent("onmousedown" , MouseEventFunc);
    // マウスカーソルを移動するたびに実行されるイベント
    canvas.attachEvent("onmousemove" , MouseEventFunc);
    // マウスボタンを離すと実行されるイベント
    canvas.attachEvent("onmouseup" , MouseEventFunc);
    // コンテキストメニューが表示される直前に実行されるイベント
    canvas.attachEvent("oncontextmenu" , MouseEventFunc);

  }else{
    console.log("event listener is not found");
  }
  ctx = canvas.getContext('2d');
  cur_mode = 'orbs'
  margin_width =margin_width  - canvas.style.margin;
  margin_height=margin_height - canvas.style.margin;
  canvas.width = margin_width*2 + board.width*orb_size;
  canvas.height= margin_height*2 + board.height*orb_size;

  var arg = new Object;
  var pair=location.search.substring(1).split('&');
  for(var i=0;pair[i];i++) {
      var kv = pair[i].split('=');
      arg[kv[0]]=kv[1];
  }
  
  if( arg.baord != undefined){
    boardURL = arg.board;
    console.log(boardURL);
  }
  if(arg.Kepri){
    isKepri = arg.Kepri;
    console.log(isKepri);
  }
  board.init();
  result.init();
  history.init();

  Asset.loadAssets(function(){
    //アセットがすべて読み込み終わったら、
    //ゲームの更新処理を始めるようにする
    requestAnimationFrame(update);
  })
}


function update(){
  requestAnimationFrame(update);
  board.moving(cur_mode);
  if(cur_mode== 'orbs'){
    board.change_color(select_color);
  }
  render();
  render_orbs(cur_mode);
}
function render_orbs(mode){

  for(var height = 0; height < board.height ; height++){
    for(var width = 0; width < board.width ; width++){
      var x =width*orb_size + margin_width;
      var y =height*orb_size + margin_height;
      // ドロップを表示する
      // つかんでいるドロップはマウスに追従させる
      if(board.cell[width][height]!== 'vanished'){
        if(board.isTouch && board.touchX == width && board.touchY == height && (mode == 'normal'|| mode =='ctw')){
          ctx.drawImage(Asset.images[board.cell[width][height]],mouseX-40,mouseY-40);
        }else{
          ctx.drawImage(Asset.images[board.cell[width][height]],x,y);
        }
      }
    }
  }

}

function render(){
  //全体をクリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //ドロップを表示

  for(var height = 0; height < board.height ; height++){
    for(var width = 0; width < board.width ; width++){
      var x =width*orb_size + margin_width;
      var y =height*orb_size + margin_height;
      //背景を表示
      if((height+width)%2 == 0){
         ctx.drawImage(Asset.images['B1'],x,y);
      }else{
         ctx.drawImage(Asset.images['B2'],x,y);
      }
    }
  }

}




//////画像読み込みの処理///////////

var Asset ={};
//アセットの定義
Asset.assets = [
  { type: 'image', name: 'R', src: 'assets/R.gif'},
  { type: 'image', name: 'G', src: 'assets/G.gif'},
  { type: 'image', name: 'B', src: 'assets/B.gif'},
  { type: 'image', name: 'Y', src: 'assets/Y.gif'},
  { type: 'image', name: 'P', src: 'assets/P.gif'},
  { type: 'image', name: 'H', src: 'assets/H.gif'},
  { type: 'image', name: 'J', src: 'assets/J.gif'},
  { type: 'image', name: 'D', src: 'assets/D.gif'},
  { type: 'image', name: 'B1', src: 'assets/B1.png'},
  { type: 'image', name: 'B2', src: 'assets/B2.png'},
];
//読み込んだ画像
Asset.images ={};

Asset.loadAssets = function(onComplete){
  var total = Asset.assets.length; //アセットの合計数
  var loadCount = 0;//読み込み完了したアセットの数

  //アセットが読み込み終わったときに呼ばれるコールバック関数
  var onLoad = function(){
    loadCount++;
    if(loadCount >= total){
      onComplete();
    }
  };

  //画像の読み込み
  Asset._loadImage = function(asset, onLoad){
    var image = new Image();
    image.src = asset.src;
    image.onload = onLoad;
    Asset.images[asset.name] = image;
  };

  //すべてのアセットを読み込む
  Asset.assets.forEach(function(asset){
    switch(asset.type){
      case 'image':
        Asset._loadImage(asset, onLoad);
        break;
    }
  });


}

//マウスイベントの処理
function MouseEventFunc(e){
  if(e.buttons !== undefined){
    var data = e.buttons;
    button_l = ((data & 0x0001) ? true : false);
    var button_r = ((data & 0x0002) ? true : false);
    var button_c = ((data & 0x0004) ? true : false);

    
    //クリックしっぱなしの時
    if(button_l){
      //座標を取得
      mouseX = e.clientX;
      mouseY = e.clientY;
          }else{
      board.isTouch = false;
      board.isBefore= false;
    }


  }
}



//パズドラのボードを作成
var board ={};
board.height = 5;
board.width = 6;
board.cell = {};
board.isTouch = false;
board.touchX = 0;
board.touchY = 0;
board.isBefore= false;
board.beforeX = 0;
board.beforeY = 0;

board.init = function(){
  board.height = 5;
  board.width = 6;
  // cellに2次元配列を作成し水ドロップを追加する
  board.cell = new Array();
  for(var width = 0; width < board.width ; width++){
    board.cell[width] = new Array();
    console.log(boardURL);
    for(var height =0; height<board.height ; height++){
      if(boardURL)board.cell[width][height]=icolor[boardURL.charAt(height*board.width+width)];
      else board.cell[width][height]='R';
    }
  }
  console.log(board.cell);
  console.log("board initialize is finished .")
}

// 境界を跨いだらドロップを入れ替え
board.moving = function(mode){
  //動きます
  if(    mouseX>= margin_width 
      && mouseX <= margin_width + board.width*orb_size
      && mouseY>= margin_height
      && mouseY <= margin_height + board.height*orb_size
      && button_l
    ){

    board.isBefore=board.isTouch;
    board.beforeX = board.touchX ;
    board.beforeY = board.touchY ;

    board.isTouch = true;
    board.touchX = Math.floor( (mouseX-margin_width)/orb_size);
    board.touchY = Math.floor( (mouseY-margin_height)/orb_size);
    console.log("clicked! ("+ board.touchX+","+board.touchY+")");
  }else{
    board.isTouch = false;
    board.isBefore= false;
  }

  if(board.isBefore && board.isTouch && (mode == 'normal' || mode == 'ctw')){
    if(board.touchX !== board.beforeX || board.touchY !== board.beforeY ){
      var tmp = board.cell[board.touchX][board.touchY];
      board.cell[board.touchX][board.touchY]=board.cell[board.beforeX][board.beforeY];
      board.cell[board.beforeX][board.beforeY]=tmp;
    }
  }
}

// colorモードの際に色の変更を行う関数
board.change_color= function(select){
  if(   mouseX>= margin_width 
      && mouseX <= margin_width + board.width*orb_size
      && mouseY>= margin_height
      && mouseY <= margin_height + board.height*orb_size
      && button_l){
    board.cell[board.touchX][board.touchY]=select;
  }
}

// パズルを行った結果をresultに保存
var result ={};
result.combo = {};
result.dell = {};
result.plus ={};
result.line= {};
result.length = {};

//コンボ数、消えたドロップの数、手数を初期化
result.init = function(){
  result.combo =  0;
  result.dell = new Array();
  for(var i=0; i< icolor.length ;i++){
    result.dell[icolor[i]] = new Array();
  }
  result.plus = new Array();
  for(var i=0; i< icolor.length ;i++){
    result.plus[icolor[i]] = 0;
  }
  result.line = new Array();
  for(var i=0; i< icolor.length ;i++){
    result.line[icolor[i]] = 0;
  }
  result.length = 0;
}
// 計算部分、board.cellとresultを更新
board.execute= function(){
  result.init();
  var tmp = -1;
    while(tmp !== result.combo){
      tmp = result.combo;
      board.elace(isKepri,result);
      board.falling();
      board.fill_random(otirand);
    }
}

board.fill_random = function(otirand){

  var index;
  var flag=true;
  for(var i = 0; i<otirand.length;i++){
    if(otirand[i])flag=false;
  }
  if(flag)return ;
  for(var width = 0; width < board.width ; width++){
    for(var height =board.height-1; height>=0 ; height--){
      if(board.cell[width][height] == 'vanished' ){
        do{
          index = Math.floor( Math.random()* 8);
        }while(!otirand[index]);
        board.cell[width][height] = icolor[index];
      }
    }
  }

  history.push(board.cell);
}

board.falling = function(){
  var count =board.height-1;
  for(var width = 0; width < board.width ; width++){
    count =board.height-1;
    for(var height =board.height-1; height>=0 ; height--){
      if(board.cell[width][height] !== 'vanished' ){
        board.cell[width][count] =board.cell[width][height];
        if(count !== height){
        board.cell[width][height] = 'vanished';
        }
        count-=1;
      }
    }
  }
  history.push(board.cell);
}

board.elace =function(isKepri, result){
  
  //番兵を用意した配列を生成する関数を用意
  var _make_Array = function(){
    var array = [];
    for(var width = 0; width < board.width +2 ; width++){
      array[width] = new Array();
      for(var height =0; height < board.height +2  ; height++){
        array[width][height] = 'vanished';
      }
    }
    return array;
  }

  // 配列の複製を生成
  function _copy_Array(src){
    var array =[];
    for(var i =0; i<src.length;i++){
      if(Array.isArray(src[i])){
        array[i] = _copy_Array(src[i]);
      }else{
        array[i] = src[i];
      }
    }
    return array;
  }

  // 配列の比較を行う
  function _comp_Array(a,b){
    var str_a = JSON.stringify(a);
    var str_b = JSON.stringify(b);
    return str_a === str_b
  }

  var state = _make_Array();
  var erace_state= _make_Array();
  var erace_copy;


  // 番兵を用意した配列に盤面を複製
  for(var width = 0; width < board.width ; width++){
    for(var height =0; height<board.height ; height++){
      state[width+1][height+1]=board.cell[width][height];
    }
  }

  //消えるドロップを取得
  for(var countW = 1; countW < board.width +1 ; countW++){
    for(var countH = 1; countH < board.height +1 ; countH++){
      //横につながって消えるドロップを探す
      if(state[countW][countH]==state[countW+1][countH] 
          && state[countW][countH]==state[countW-1][countH] 
          && state[countW][countH]!=='vanished'){
        erace_state[countW][countH]   = state[countW][countH];
        erace_state[countW+1][countH] = state[countW][countH];
        erace_state[countW-1][countH] = state[countW][countH];
      }
      //縦につながって消えるドロップを探す
      if(state[countW][countH]==state[countW][countH+1] 
          && state[countW][countH]==state[countW][countH-1] 
          && state[countW][countH]!=='vanished'){
        erace_state[countW][countH]    = state[countW][countH];
        erace_state[countW][countH +1] = state[countW][countH];
        erace_state[countW][countH -1] = state[countW][countH];
      }
    }
  }

  erace_copy = _copy_Array(erace_state);

  //一緒に消えるドロップを取得し処理を行う
  for(var countW = 1; countW < board.width +1 ; countW++){
    for(var countH = 1; countH < board.height +1 ; countH++){
      //ブロックスコープの代わり
      (function(countW,countH){
        if(erace_state[countW][countH]=='vanished')return 1;
        var tmp = _make_Array();
        var before ;
        var dirX = [1,-1,0,0];
        var dirY = [0,0,1,-1];
        tmp[countW][countH] = erace_state[countW][countH];
        
        // 一度にまとまって消えるドロップを選び出す。
        // todo 遅かったら後からもうちょっとましにする。
        do{
          before = _copy_Array(tmp);

          for(var countW = 1; countW < board.width +1 ; countW++){
            for(var countH = 1; countH < board.height +1 ; countH++){
              if(tmp[countW][countH]!=='vanished'){
                for(var dir = 0; dir < 4; dir ++){
                  if(erace_state[countW+dirX[dir]][countH+dirY[dir]] 
                      == tmp[countW][countH]){
                    tmp[countW+dirX[dir]][countH+dirY[dir]] =tmp[countW][countH];
                  }
                }
              }
            }
          }

        }while( !_comp_Array(before,tmp) );

        // erace_stateからtmpのドロップを消す
        for(var countW = 1; countW < board.width +1 ; countW++){
          for(var countH = 1; countH < board.height +1 ; countH++){
            if(tmp[countW][countH]!=='vanished'){
              erace_state[countW][countH] = 'vanished';
            }
          }
        }

        //tmpから情報を取得する
        //ドロップの数を数える。
        //列消しがあるかどうか
        //十字消しがあるかどうか
        var count = 0;
        var color;
        var isPlus = false;
        var isLine = false;
        var isBufLine = true;
        for(var countH = 1; countH < board.height +1 ; countH++){
          isBufLine =true;
          for(var countW = 1; countW < board.width +1 ; countW++){
            if(tmp[countW][countH]!=='vanished'){
              count++;
              color = tmp[countW][countH];
              if( tmp[countW][countH] == tmp[countW+1][countH] 
                  &&tmp[countW][countH] == tmp[countW-1][countH] 
                  &&tmp[countW][countH] == tmp[countW][countH+1] 
                  &&tmp[countW][countH] == tmp[countW+1][countH-1] 
                ){
                isPlus = true;
               }
            }else{
              isBufLine = false;
            }
          }
          if(isBufLine) isLine =true;
        }
        if(count !== 5) isPlus = false; 
        console.log(count);
        if(isKepri&&count<=4){
          // erace_stateからtmpのドロップを消す
          for(var countW = 1; countW < board.width +1 ; countW++){
            for(var countH = 1; countH < board.height +1 ; countH++){
              if(tmp[countW][countH]!=='vanished'){
                erace_copy[countW][countH] = 'vanished';
              }
            }
          }
        }else{
          // 結果をresultに記録
          result.combo +=1;
          result.dell[color].push(count);
          if(isLine) result.line[color] += 1;
          if(isPlus) result.plus[color] += 1;
        }

      })(countW,countH);
    }
  }

  //boardからコンボで消えたドロップを消去
  for(var width = 0; width < board.width ; width++){
    for(var height =0; height<board.height ; height++){
      if(erace_copy[width+1][height+1]!== 'vanished'){
        board.cell[width][height] = 'vanished';
      }
    }
  }
  history.push(board.cell);
  return  0;
}

//ボタンのクリック数を処理
function set_mode(mode){
  cur_mode=mode;
  console.log(cur_mode);
  history.push(board.cell);
}

function set_color(clr){
  cur_mode="orbs"
    select_color = clr;
    history.push(board.cell);
  console.log(select_color);
}
// ボードの大きさを変更
function newBoard(){
  if(isFinite(document.dict.width.value)&&isFinite(document.dict.height.value)){
    if(   document.dict.width.value>0 
        &&document.dict.width.value<20
        &&document.dict.height.value>0 
        &&document.dict.height.value<20
      ){
        board.width=document.dict.width.value;
        board.height=document.dict.height.value;
        canvas.width = margin_width*2 + board.width*orb_size;
        canvas.height= margin_height*2 + board.height*orb_size;

      }else{
        alert("1から19までの半角整数を入力してください。");
      return ;
    }
  }else{
    alert("整数を入力してください(1以上20未満)");
    return ;
  }

  console.log(document.dict.width.value);
  // cellに2次元配列を作成し水ドロップを追加する
  board.cell = new Array();
  for(var width = 0; width < board.width ; width++){
    board.cell[width] = new Array();
    for(var height =0; height<board.height ; height++){
      board.cell[width][height]='B';
    }
      board.cell[width][0]='R';
  }
  
}

//あぁ＾～
function unko_no_umi(){
  for(var height = 0; height < board.height ; height++){
    for(var width = 0; width < board.width ; width++){
      board.cell[width][height]='D';
    }
  }

}

function onRadioButtonChange(entry){
  otirand[entry]=!otirand[entry];
  console.log(otirand);
}

function stepbystep(){
  if(step_count%3 == 0){
    board.elace(isKepri,result);
  }else if(step_count%3 ==1){
    board.falling();
  }else{
    board.fill_random(otirand);
  }
  step_count+=1;
}
function stepbystep_without_otikon(){
  if(step_count%3 == 0){
    board.elace(isKepri,result);
  }else if(step_count%3 ==1){
    board.falling();
  }else{
    step_count+=1;
    stepbystep_without_otikon();
    step_count-=1;
  }
  step_count+=1;
}

function change_mode_Kepri(){
  isKepri = !isKepri;
  console.log(isKepri);
}
function erace_button(){
board.elace(isKepri,result);
}

//配列のコピー
function copy_Array(src){
  var array =[];
  for(var i =0; i<src.length;i++){
    if(Array.isArray(src[i])){
      array[i] = copy_Array(src[i]);
    }else{
      array[i] = src[i];
    }
  }
  return array;
}

////////////////////履歴機能//////////////////////
//  履歴に追加：history.push(src);              //
//  次に進む：history.next(src);                //
//  前に戻る：history.prev(src);                //
//////////////////////////////////////////////////
var history ={};
history.id ={};
history.cur ={};
history.index ={};
history.max = {};
history.data ={};

//履歴の初期化
history.init = function(){
  history.id = [];
  history.cur = 0;
  history.maxid = 0;
  history.max = 100;
  history.data = [];
};

//次の履歴に進む
history.next = function(src){
 var curindex = history.id.indexOf(history.cur);
 var nextindex = curindex+1;
 if(nextindex < history.id.length){
   history.cur = history.id[nextindex];
 history.load(src);
 }
}

//前の履歴に戻る
history.prev = function(src){
 var curindex = history.id.indexOf(history.cur);
 var previndex = curindex-1;
 if(previndex >=0){
   history.cur = history.id[previndex];
   history.load(src);
 }
}

//curの履歴を読み出してsrcにコピーする機能
history.load = function(src){
 var curindex = history.id.indexOf(history.cur);
 board.cell = copy_Array(history.data[curindex])
}

//最新の行動を追加
history.push = function(src){
  history.maxid++;
  while(history.id.length >0 && history.id.indexOf(history.cur) !== ( history.id.length -1) ){
    history.pop_back();
  }
  history.id.push(history.maxid);
  history.data.push(copy_Array(src));
  history._checksize();
  history.cur=history.maxid;
  console.log(history);
}
//最新の行動を削除
history.pop_back = function(){
  //id + data のpopback
  history.id.pop();
  history.data.pop();
}

//最後の行動を削除
history.pop_front = function(){
  history.id.shift();
  history.data.shift();
}

//ヒストリーサイズのチェックを行い、古い行動を削除する
history._checksize = function(){
  while(history.data.length > history.max ){
    history.pop_front();
  }
}

//最初の行動に移動
history.first = function(src){
  if(history.id.length<=0)return 1;
 history.cur = history.id[0];
 history.load(src);
 return 0;
}

//最後の行動に移動
history.end = function(src){
  if(history.id.length<=0)return 1;
 history.cur = history.id[history.id.length-1];
 history.load(src);
 return 0;
}
//履歴ボタンの制御
function onHistoryButton(nButton){
  console.log(nButton+"is clicked ")
  if(nButton == 0){
    history.first(board.cell);
  }else if(nButton ==1){
    history.prev(board.cell);
  }else if(nButton ==2){
    history.next(board.cell);
  }else if(nButton ==3){
    history.end(board.cell);
  }
  console.log(history);
}
