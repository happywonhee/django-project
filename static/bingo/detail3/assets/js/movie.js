'use strict';
window.FrameMovies = (function () {

  /**
   * コンストラクタ
   * @param  {String} id View生成領域のid名
   * @param  {Object} options 追加設定
   */

  var FrameMovies = function (id, options) {
    if (!(this instanceof FrameMovies)) {
      return new FrameMovies();
    }
    this.config = this._setConfig(id, options);
    this.data = [];
  };

  /**
   * 設定類をまとめる関数
   * @param  {Object} options 追加設定
   * @return {Object} 設定をまとめたオブジェクト
   */
  FrameMovies.prototype._setConfig = function (id, options) {
    var _o = {
      id: id,
      jsonPath: options.jsonPath ? options.jsonPath : null, // jsonファイルのパス
      thumbDir: options.thumbDir ? options.thumbDir : null, // サムネイル画像のディレクトリ
      breakPoint: options.breakPoint ? options.breakPoint : 767, // ブレイクポイント
      buffer: options.buffer ? options.buffer : null, // スクロール位置に持たせたいバッファ：高さ(変数可)
      topTemplateId: options.topTemplateId ? options.topTemplateId : 'tpl-movies-top',
      topRenderId: options.topRenderId ? options.topRenderId : 'js-movies-top',
      itemTemplateId: options.itemTemplateId ? options.itemTemplateId : 'tpl-movies-item',
      itemRenderClass: options.itemRenderClass ? options.itemRenderClass : 'js-movies-item',
      activeClass: 'is-active', // アクティブクラス
      hiddenClass: 'is-hidden', // 非表示クラス
      readyClass: 'is-ready', // 再生準備完了クラス
    };
    return _o;
  };

  /**
   * APIから取得したデータを加工
   */
  FrameMovies.prototype.parseData = function (nowTime) {
    var self = this;
    return this.fetchData()
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var _pageData = [];
        var _thumbDir = [];
        var _newFlag;
        if (self.config.thumbDir) _thumbDir = self.config.thumbDir;
        data.forEach(function (e) {
          var obj = {};
          // Newフラグ
          e._newFlag = 'false';
          if (e.newFlag == 1) e._newFlag = 'true';
          obj.newFlag = e._newFlag;
          // 終了日時
          obj.endDate = e.endDate;
          // 終了日時（ミリ秒）
          obj.endTime = new Date(e.endDate).getTime();
          // 動画タイトル
          obj.title = e.title;
          // 動画ID
          obj.youtubeID = e.youtubeID;
          // サムネイル画像のパス
          obj.thumbPath = _thumbDir + e.thumbPath;
          // カテゴリー
          obj.category = e.category;
          // アイテムID
          obj.itemID = e.itemID;
          _pageData.push(obj);
        });
        _pageData.forEach(function (e) {
          // 終了日時がサーバー日時を過ぎていないデータを取得
          if (!e.endTime || e.endTime > nowTime) {
            self.data.push(e);
          }
        });
      });
  };

  /**
   * fetch APIでデータ取得
   * @return {Object} fetch APIのPromiseオブジェクト
   */
  FrameMovies.prototype.fetchData = function () {
    var _url = this.config.jsonPath;
    return fetch(_url, { method: 'GET' });
  };

  /**
   * htmlを生成
   */
  FrameMovies.prototype.buildHtml = function (templateId, data, num) {
    var tpl = document.getElementById(templateId).text;
    var html = '';
    if (data) {
      if (num === undefined) {
        data.forEach(function (e) {
          html += tpl.replace(/{{(\w+)}}/g, function (m, key) {
            var text = e[key] || '';
            return text;
          });
        });
      } else {
        html += tpl.replace(/{{(\w+)}}/g, function (m, key) {
          var text = data[num][key] || '';
          return text;
        });
      }
    }
    return html;
  };

  /**
   * htmlを表示
   */
  FrameMovies.prototype.renderTopHtml = function (templateId, targetId, data, num) {
    var htmltxt = this.buildHtml(templateId, data, num);
    var html = DOMPurify.sanitize(htmltxt);
    var body = document.getElementById(targetId);
    body.insertAdjacentHTML('beforeend', html);
  };
  FrameMovies.prototype.renderItemHtml = function (templateId, targetClass, data, num) {
    var self = this;
    var body = document.querySelectorAll('.' + targetClass + '');
    var n = 0;
    body.forEach(function (bodies) {
      n ++;
      bodies.dataset.length = data.length;
      bodies.dataset.index = n;
      var categories = bodies.dataset.category;
      if (categories) {
        var dataCats = data.filter(function (data, index) {
          if (data.category == categories) return true;
        });
        var htmltxt = self.buildHtml(templateId, dataCats, num);
        var html = DOMPurify.sanitize(htmltxt);
        bodies.insertAdjacentHTML('beforeend', html);
      } else {
        var htmltxt = self.buildHtml(templateId, data, num);
        var html = DOMPurify.sanitize(htmltxt);
        bodies.insertAdjacentHTML('beforeend', html);
      }
    });
  };

  /**
   * URLのパラメータをチェック
   */
  FrameMovies.prototype.paramCheck = function (str) {
    var str = [];
    var urlParam = location.search.substring(1);
    if (urlParam) {
      var _param = urlParam.split('&');
      var paramArray = [];
      for (var i = 0; i < _param.length; i++) {
        var paramItem = _param[i].split('=');
        paramArray[paramItem[0]] = paramItem[1];
      }
      // ?item=以下の値を取得
      if (paramArray.item) str.push(paramArray.item);
      return str;
    }
  };

  /**
   * fetch APIでデータ取得
   * サーバー日時取得
   * Viewを生成
   */
  FrameMovies.prototype.start = function () {
    var self = this;
    // サーバー日時取得
    var req = new XMLHttpRequest();
    req.open('HEAD', window.location.href, true);
    req.send();
    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        var serverDate = new Date(req.getResponseHeader('Date'));
        var serverTime = serverDate.getTime();
        self.parseData(serverTime).then(function () {
          if (self.data.length) {
            var firstYoutubeID = self.data[0].youtubeID;
            // URLのパラメータをチェック
            if (self.paramCheck(self.itemID)) {
              for (var i = 0; i < self.data.length; i++) {
                if (self.data[i].itemID == self.paramCheck(self.itemID)) firstYoutubeID = self.data[i].youtubeID;
              }
            }
            self.renderTopHtml(self.config.topTemplateId, self.config.topRenderId, self.data, 0);
            self.renderItemHtml(self.config.itemTemplateId, self.config.itemRenderClass, self.data);
            self.registerHandlers(firstYoutubeID);
          }
        });
      }
    };
  };

  /**
   * イベントハンドラを登録
   */
  FrameMovies.prototype.registerHandlers = function (firstYoutubeID) {
    var self = this;
    var UA = window.navigator.userAgent.toLowerCase(); // ユーザーエージェント
    var mqlSP = window.matchMedia('screen and (max-width:' + self.config.breakPoint + 'px)'); // メディアクエリ
    var docs = document.getElementById(self.config.id),
      topBtn = docs.querySelector('.js-movie-top-btn'),
      thumbBtn = docs.querySelectorAll('.js-movie-thumb-btn');
    var managerTop = [];
    var movieTop;
    var managerModal = [];
    var movieModal;
    Promise.resolve()
    .then(function () { // DOMの初期化
      self.documentReady(firstYoutubeID, mqlSP);
    })
    .then(function () { // Youtube API
      self.youtubeInit(UA, mqlSP, managerTop, movieTop, managerModal, movieModal);
    })
    .then(function () {
      topBtn.addEventListener( // トップサムネイルのクリック
        'click',
        self.clickMoviePlay.bind(self, managerTop),
        false);
      thumbBtn.forEach(function (thisBtn) {
        thisBtn.addEventListener( // サムネイル群のクリック
          'click',
          self.clickMovieChange.bind(self, thisBtn, UA, mqlSP, managerTop, managerModal),
          false
        );
      });
      document.addEventListener( // モーダル閉じる
        'click',
        self.clickModalClose.bind(self, UA, managerModal),
        false
      );
    })
    .catch(function () { // DOMの初期化
      self.documentReady(firstYoutubeID, mqlSP);
    });
  };

  /**
   * DOMの初期化
   */
  FrameMovies.prototype.documentReady = function(firstYoutubeID,mqlSP){
    var self = this;
    var docs = document.getElementById(self.config.id),
      head = docs.querySelector('.js-movie-head'),
      topFrame = docs.querySelector('.js-movie-top-frame'),
      topImg = docs.querySelector('.js-movie-top-img'),
      topBtn = docs.querySelector('.js-movie-top-btn'),
      thumbImg = docs.querySelectorAll('.js-movie-thumb-img'),
      thumbBtn = docs.querySelectorAll('.js-movie-thumb-btn');
    var _buffer = 0;
    if (self.config.buffer) {
      _buffer = self.config.buffer;
    }
    // トップサムネイル
    topFrame.classList.add(self.config.hiddenClass); // フレーム非表示
    topFrame.children[0].setAttribute('id', 'js-movie-content'); // フレームラベルにID付与
    for (var i = 0; i < thumbBtn.length; i++) {
      if (thumbBtn[i].dataset.id == firstYoutubeID) {
        thumbBtn[i].classList.add(self.config.activeClass); // ボタンアクティブ
        head.innerHTML = thumbBtn[i].querySelector('img').getAttribute('alt'); // 動画タイトルをセット
        topImg.querySelector('img').setAttribute('src', '' + thumbBtn[i].querySelector('img').getAttribute('src').replace('_s','') + ''); // 動画srcをセット
        topImg.querySelector('img').setAttribute('alt', '' + thumbBtn[i].querySelector('img').getAttribute('alt') + ''); // 画像altをセット
        topBtn.dataset.id = thumbBtn[i].dataset.id; // 動画IDをセット
        var thumbNew = thumbBtn[i].parentNode.dataset.new;
        if (thumbNew) {
          head.parentNode.dataset.new = thumbNew; // NEWマーク付与
        }
        if (mqlSP.matches) { // SP時
          // URLのパラメータをチェック
          if (self.paramCheck(self.itemID) && self.paramCheck(self.itemID).length) {
            // サムネイル群までスクロール
            window.scrollTo(0, 0);
            setTimeout(
              function (index) {
                var offset = window.pageYOffset || document.documentElement.scrollTop;
                var btnPos = offset + thumbBtn[index].getBoundingClientRect().top - _buffer;
                window.scrollTo(0, btnPos);
              }.bind(null, i),
              100
            );
          }
        }
      }
    }
    // 動画モーダルを生成
    var modal =
    '<div class="p-movie-modal" style="display: none;">'
      + '<div class="p-movie-modal-wrap">'
        + '<div class="p-movie-modal-bg js-movie-modal-close"></div>'
        + '<div class="p-movie-modal-panel">'
          + '<div class="p-movie-modal-panel__item">'
            + '<div class="p-movie-modal__inner">'
              + '<div class="p-movie-modal-body">'
                + '<div class="p-movie-modal-frame js-movie-modal-frame">'
                + '<span class="p-movie-modal-frame__label" id="js-movie-modal-content"></span>'
                + '</div>'
              + '</div>'
              + '<a class="p-movie-modal-close-btn js-movie-modal-close">'
                + '<span class="p-movie-modal-close-btn__ico"></span>'
              + '</a>'
            + '</div>'
          + '</div>'
        + '</div>'
      + '</div>'
    + '</div>'
    ;
    document.body.insertAdjacentHTML('beforeend',modal);
  };

  /**
   * トップサムネイルのクリック
   */
  FrameMovies.prototype.clickMoviePlay = function (managerTop, e) {
    e.preventDefault();
    var self = this;
    var docs = document.getElementById(self.config.id),
      topFrame = docs.querySelector('.js-movie-top-frame'),
      topImg = docs.querySelector('.js-movie-top-img'),
      topBtn = docs.querySelector('.js-movie-top-btn');
    if (topFrame.classList.contains(self.config.readyClass)) { // 再生準備完了
      topFrame.classList.remove(self.config.hiddenClass); // フレーム表示
      topImg.classList.add(self.config.hiddenClass); // 画像非表示
      managerTop[0].loadVideoById(topBtn.dataset.id);
      managerTop[0].seekTo(0);
      managerTop[0].playVideo(); // 最初から再生
    }
  };

  /**
   * サムネイル群のクリック
   */
  FrameMovies.prototype.clickMovieChange = function (thisBtn, UA, mqlSP, managerTop, managerModal, e) {
    e.preventDefault();
    var self = this;
    var docs = document.getElementById(self.config.id),
      head = docs.querySelector('.js-movie-head'),
      topFrame = docs.querySelector('.js-movie-top-frame'),
      topImg = docs.querySelector('.js-movie-top-img'),
      topBtn = docs.querySelector('.js-movie-top-btn'),
      thumbBtn = docs.querySelectorAll('.js-movie-thumb-btn'),
      modalFrame = document.querySelector('.js-movie-modal-frame');
    var fixed = 'is-movie-fixed-modal',
      opened = 'is-movie-opened-modal',
      closed = 'is-movie-closed-modal';
    if (topFrame.classList.contains(self.config.readyClass)) { // 再生準備完了
      for (var i = 0; i < thumbBtn.length; i++) {
        thumbBtn[i].classList.remove(self.config.activeClass); // ボタン非アクティブ
      }
      thisBtn.classList.add(self.config.activeClass); // ボタンアクティブ
      topFrame.classList.remove(self.config.hiddenClass); // フレーム表示
      topImg.classList.add(self.config.hiddenClass); // 画像非表示
      head.innerHTML = thisBtn.querySelector('img').getAttribute('alt'); // 動画タイトルをセット
      topImg.querySelector('img').setAttribute('src', '' + thisBtn.querySelector('img').getAttribute('src').replace('_s','') + ''); // 動画srcをセット
      topImg.querySelector('img').setAttribute('alt', '' + thisBtn.querySelector('img').getAttribute('alt') + ''); // 画像altをセット
      var thisNew = thisBtn.parentNode.dataset.new;
      if (thisNew) {
        head.parentNode.dataset.new = thisNew; // NEWマーク付与
      }
      if (!mqlSP.matches) { // PC時
        // トップサムネイルまでスクロール
        var _buffer = 0;
        if (self.config.buffer) {
          _buffer = self.config.buffer;
        }
        var offset = window.pageYOffset || document.documentElement.scrollTop;
        var scrollPos = offset + topFrame.getBoundingClientRect().top - _buffer;
        window.scrollTo(0,scrollPos);
        managerTop[0].loadVideoById(thisBtn.dataset.id);
        managerTop[0].seekTo(0);
        managerTop[0].playVideo(); // 最初から再生
        topBtn.dataset.id = thisBtn.dataset.id; // 動画IDをセット
      }
    }
    if (modalFrame.classList.contains(self.config.readyClass)) { // 再生準備完了
      if (mqlSP.matches) { // SP時
        // モーダル開く
        document.querySelector('.p-movie-modal-wrap').style.display = 'block';
        var y = window.scrollY;
        setTimeout(function(){
          document.body.classList.add(opened);
          document.body.classList.remove(closed);
          if(UA.indexOf('android') <= 0){ // Androidではない場合
            document.body.classList.add(fixed);
            document.body.style.top = ''+ y * -1 +'px'; /* 背景の固定 */
          }
        },1);
        managerModal[0].loadVideoById(thisBtn.dataset.id);
        managerModal[0].seekTo(0);
        managerModal[0].playVideo(); // 最初から再生
        topBtn.dataset.id = thisBtn.dataset.id; // 動画IDをセット
      }
    }
  };

  /**
   * モーダル閉じる
   */
  FrameMovies.prototype.clickModalClose = function (UA, managerModal, e) {
    var fixed = 'is-movie-fixed-modal',
      opened = 'is-movie-opened-modal',
      closed = 'is-movie-closed-modal';
    var target = e.target;
    if(target.classList.contains('js-movie-modal-close')){
      document.body.classList.add(closed);
      document.body.classList.remove(opened);
      if(UA.indexOf('android') <= 0){ // Androidではない場合
        document.body.classList.remove(fixed);
        var y = parseInt(document.body.style.top);
        window.scroll(0, y * -1); /* 背景の固定解除 */
      }
      setTimeout(function(){
        document.body.classList.remove(closed);
        document.querySelector('.p-movie-modal-wrap').style.display = 'none';
        document.body.removeAttribute('style'); /* 背景の固定解除 */
      },200);
      managerModal[0].pauseVideo(); // 一時停止
    }
  };

  /**
   * Youtube API
   */
  FrameMovies.prototype.youtubeInit = function (UA, mqlSP, managerTop, movieTop, managerModal, movieModal) {
    var self = this;
    var docs = document.getElementById(self.config.id),
      topBtn = docs.querySelector('.js-movie-top-btn'),
      topFrame = docs.querySelector('.js-movie-top-frame'),
      topImg = docs.querySelector('.js-movie-top-img'),
      modalFrame = document.querySelector('.js-movie-modal-frame');

    var scriptTag = document.createElement('script');
    scriptTag.src = 'https://www.youtube.com/iframe_api';
    var fsTag = document.getElementsByTagName('script')[0];
    fsTag.parentNode.insertBefore(scriptTag, fsTag);

    var playerVarsOption;
      if(UA.indexOf('android') <= 0 && mqlSP.matches){ // Androidではない場合
        playerVarsOption = {autoplay: 0, controls: 1, playsinline: 0};
      }else{
        playerVarsOption = {autoplay: 0, controls: 1, playsinline: 1};
      }

    window.onYouTubeIframeAPIReady = function () {
      movieTop = new YT.Player('js-movie-content', {
        height: '540',
        width: '960',
        videoId: topBtn.dataset.id,
        playerVars: playerVarsOption,
        events: {
          onReady: onTopReady,
          onStateChange: onTopStateChange
        },
      });
      managerTop.push(movieTop);
      movieModal = new YT.Player('js-movie-modal-content', {
        height: '540',
        width: '960',
        videoId: topBtn.dataset.id,
        playerVars: playerVarsOption,
        events: {
          onReady: onModalReady,
          onStateChange: onModalStateChange
        },
      });
      managerModal.push(movieModal);
    };
    function onTopReady() {
      topFrame.classList.add(self.config.readyClass); // 再生準備完了
    };
    function onTopStateChange() {
      var state = managerTop[0].getPlayerState();
      switch (state) {
        case 1: // 再生中
          managerModal[0].pauseVideo(); // 多重再生防止
          break;
        case 0: // 再生終了
          topFrame.classList.add(self.config.hiddenClass); // フレーム非表示
          topImg.classList.remove(self.config.hiddenClass); // 画像表示
          break;
      }
    };
    function onModalReady() {
      modalFrame.classList.add(self.config.readyClass); // 再生準備完了
    };
    function onModalStateChange() {
    var fixed = 'is-movie-fixed-modal',
      opened = 'is-movie-opened-modal',
      closed = 'is-movie-closed-modal';
      var state = managerModal[0].getPlayerState();
      switch (state) {
        case 1: // 再生中
          managerTop[0].pauseVideo(); // 多重再生防止
          break;
        case 0: // 再生終了
          // モーダル閉じる
          document.body.classList.add(closed);
          document.body.classList.remove(opened);
          if(UA.indexOf('android') <= 0){ // Androidではない場合
            document.body.classList.remove(fixed);
            var y = parseInt(document.body.style.top);
            window.scroll(0, y * -1); /* 背景の固定解除 */
          }
          setTimeout(function(){
            document.body.classList.remove(closed);
            document.querySelector('.p-movie-modal-wrap').style.display = 'none';
            document.body.removeAttribute('style'); /* 背景の固定解除 */
          },200);
          break;
      }
    };
  };

  return FrameMovies;
})();

var myMovies = new FrameMovies('js-movies',{
  jsonPath: '../assets/data/movie.json',
  thumbDir: '../assets/img/movie/thumb/',
  breakPoint: 767,
  buffer: ''
});

window.addEventListener('DOMContentLoaded',function(){
  myMovies.start();
});
