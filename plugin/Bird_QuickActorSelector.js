//=============================================================================
// RPG Maker MZ - Quick Actor Selector
//=============================================================================
// version 1.0.2
//=============================================================================
// 2021-10-26 - v1.0.2       - 添加網址資訊。
// 2021-10-26 - v1.0.1       - 修正錯字。
// 2021-10-26 - v1.0.0       - 最初版本。
//=============================================================================

/*:
 * @target MZ
 * @author 竹鳥
 * @url https://home.gamer.com.tw/homeindex.php?owner=sansarea
 * @plugindesc (v1.0.1) 添加了新介面以令玩家能快速瀏覽及選擇操控角色。
 *
 * @help Bird_QuickActorSelector.js
 * 
 * # 功能簡介
 * 
 * 當玩家按下指定按鍵，他能呼叫出一個簡單的窗口，並以方向鍵查看隊伍內各個角色的資料。
 * 
 * 當玩家放開指定按鍵，則依據當前顯示的角色資料更換隊伍順序。
 * 
 * 目前主要功能已大致完成，但缺乏部份細節與自定義選項。
 * 
 * |-------------------------------|
 * |                               |
 * |                               |
 * |                               |
 * |         |-----------|         |
 * |       < | XXX  Lv:1 | >       |
 * |         |-----------|         |
 * |-------------------------------|
 * 
 * @param input_keycode
 * @type number
 * @default 67
 * @text 呼叫介面的按鍵
 * @desc 請注意，這裡應使用「鍵碼／Key code」，而不是按鍵名稱（如「c」或「Enter」）。可以此查詢 https://keycode.info/ 。
 *
 * @param trigger_gap
 * @type string
 * @default 25, 20, 10, 5
 * @text 介面觸發切換的等待毫秒
 * @desc 可以使用此參數以調整介面切換速度，請以半形逗號分隔。
 * 數量不限，可留空，但只能在數字前後。
 *
 * @param scroll_loop
 * @type string
 * @default both
 * @text 介面是否可以循環
 * @desc 僅能使用此處四項：「both」：兩側都可循環；「left」：僅左側；「right」：僅右側；「none」：不可循環。
 * 
 */

//=============================================================================
// TODO: 目前尚未進行，但有考慮要做的功能列表。
//   1. 自定義顯示內容。
//   2. 介面動畫。
//   3. 顯示立繪及立繪動畫。
//   4. 錯誤處理。
//=============================================================================

/**
 * @typedef {import("../rmmz_objects.js").Game_Actor} GameActor 遊戲角色數據。
 * @typedef {Array.<GameActor>} GameActorList 遊戲角色隊伍列表。
 * @typedef {{displayX: number, displayY: number, imageX: number, imageY: number, imageW: number, imageH: number}} ArrowPosition
 */



(() => {

    //=============================================================================
    // 插件初始化。
    //=============================================================================


    /**
     * 檔案名稱。
     * 
     * 如果你有更改檔名，請保持這個值與檔名一致，否則無法讀取到插件參數。
     */
    const filename = "Bird_QuickActorSelector"

    const Birds = Symbol.for("Bird_Plugins")
    const thisPlugin = Symbol.for(filename)

    // 註冊此插件。
    window[Birds] = window[Birds] || {}
    window[Birds][thisPlugin] = window[Birds][thisPlugin] || {
        scriptName: filename,
    }

    // 取得使用者設定的插件參數
    const userParams = PluginManager.parameters(filename)

    //=============================================================================

    /**
     * 輸入鍵碼對應標記。
     * 
     * 這是一段隨機字串，因為除非當它與其他插件衝突，否則這個變數不會影響任何功能。
     * 
     * 若有需要也可以自由更改。
     */
    const _inputName = "2dbc2fd2358e1ea1b7a6bc08ea647b9a337ac92d"

    //=============================================================================

    const _param_inputKeycode = userParams["input_keycode"]
    /**
     * 用以觸發插件介面的實際按鍵鍵碼。
     *
     * `67` 對應於 `c` 。
     *
     * @type {number}
     */
    const _inputKeycode = !_param_inputKeycode || _param_inputKeycode === ""
        ? 67
        : Number(_param_inputKeycode)

    //=============================================================================

    const _param_triggerGap = userParams["trigger_gap"]
    /**
     * 介面切換每次觸發的等待時間（毫秒）。
     * 
     * @type {number[]}
     */
    const _triggerGap = !_param_triggerGap || _param_triggerGap === ""
        ? [25, 20, 10, 5]
        : _param_triggerGap.split(",").map(v => Number(v))

    //=============================================================================

    const _parma_scrollLoop = userParams["scroll_loop"]
    /**
     * 窗口切換是否可以循環。
     * 
     * - `"both"`：兩個方向都可以循環。
     * - `"left"`：只有左側可以循環。
     * - `"right"`：只有右側可以循環。
     * - `"none"`：兩側都不能循環。
     * 
     * @type {"both" | "left" | "right" | "none"}
     */
    const _scrollLoop = !_parma_scrollLoop || _parma_scrollLoop === ""
        || !["both", "left", "right", "none"].includes(_parma_scrollLoop)
        ? "both"
        : _parma_scrollLoop

    //=============================================================================

    /**
     * 是否開啟動畫效果。但是動畫效果還沒開始做。
     * 
     * @type {boolean}
     */
    const _uiAnimate = true



    //=============================================================================
    // 介面場景。
    //=============================================================================



    /**
     * @extends {import("../rmmz_scenes.js").Scene_MenuBase}
     */
    function Scene_BirdsQuickSelector() {
        this.initialize(...arguments)
    }

    Scene_BirdsQuickSelector.prototype = Object.create(Scene_MenuBase.prototype)
    Scene_BirdsQuickSelector.prototype.constructor = Scene_BirdsQuickSelector

    Scene_BirdsQuickSelector.prototype.initialize = function () {
        Scene_MenuBase.prototype.initialize.call(this)

    }

    Scene_BirdsQuickSelector.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this)

        this.initParames()
        this._createActorsCard()
    }

    /**
     * 初始化參數。
     */
    Scene_BirdsQuickSelector.prototype.initParames = function () {
        /**
         * 目前介面狀態。
         * 
         * @type {"close" | "opening" | "open" | "closeing"}
         */
        this._uiStatus = "close"
        /**
         * 按鍵觸發狀態。
         * 
         * @type {"relax" | "busy"}
         */
        this._inputStatus = "relax"

        /**
         * 開啟介面時的角色資料。
         */
        this._party = {
            order: $gameParty.members(),
            index: 0,
        }

        /**
         * 切換角色資訊的計時數據。
         */
        this._timer = {
            wait: 0,
            list: _triggerGap,
            index: 0,
            idxMax: _triggerGap.length - 1,
        }

        this._boxLineHeight = 3
    }

    Scene_BirdsQuickSelector.prototype.needsCancelButton = function () {
        return false
    }

    /**
     * 取得目前級別的等待時間（毫秒）。
     * 
     * @returns {number}
     */
    Scene_BirdsQuickSelector.prototype._getCurrentWaitTime = function () {
        return this._timer.list[this._timer.index]
    }

    /**
     * 建立選擇角色的介面。
     * 
     * 位於畫面置底正中央。
     */
    Scene_BirdsQuickSelector.prototype._createActorsCard = function () {
        const windowWidth = parseInt(Graphics.boxWidth * 0.36)
        const windowHeight = this.calcWindowHeight(this._boxLineHeight, false)
        const rect = new Rectangle(
            (Graphics.width - windowWidth) / 2,
            Graphics.height - windowHeight - 8,
            windowWidth,
            windowHeight)
        this._selectWindow = new Window_BirdsQuickSelector(rect, this._party, this._boxLineHeight)
        this.addWindow(this._selectWindow)
    }

    Scene_BirdsQuickSelector.prototype.start = function () {
        Scene_MenuBase.prototype.start.call(this)
        this._selectWindow.refresh()
    }

    /**
     * 令介面顯示下一個角色。
     */
    Scene_BirdsQuickSelector.prototype.useSetToNext = function () {
        this._selectWindow.setToNext()
    }

    /**
     * 令介面顯示上一個角色。
     */
    Scene_BirdsQuickSelector.prototype.useSetToPrev = function () {
        this._selectWindow.setToPrev()
    }

    Scene_BirdsQuickSelector.prototype.update = function () {
        Scene_MenuBase.prototype.update.call(this)

        if (!Input.isPressed(_inputName))
            return this.closeSelector()

        if (this._inputStatus === "busy" && this._timer.wait > 1)
            return this._timer.wait -= 1

        this._setTriggerTime()
        this._setWaitTime()
        this._useSwitchCharacterData()
    }

    /**
     * 判斷是否長壓以更新觸發資料切換的時間。
     * 
     * @returns {void}
     */
    Scene_BirdsQuickSelector.prototype._setTriggerTime = function () {
        if (Input.isPressed("right") || Input.isPressed("left"))
            this._inputStatus = "busy"
        else
            this._inputStatus = "relax"

        if (this._timer.index < this._timer.idxMax
            && (Input.isLongPressed("right") || Input.isLongPressed("left")))
            return this._timer.index += 1

        if (this._timer.index !== 0
            && !Input.isPressed("right") && !Input.isPressed("left"))
            return this._timer.index = 0
    }

    /**
     * 判斷是否有點擊方向鍵，以切換目前所顯示的角色資料。
     * 
     * @returns {void}
     */
    Scene_BirdsQuickSelector.prototype._useSwitchCharacterData = function () {
        if (Input.isPressed("right")) return this.useSetToNext()
        if (Input.isPressed("left")) return this.useSetToPrev()
    }

    Scene_BirdsQuickSelector.prototype._setWaitTime = function () {
        this._timer.wait = this._getCurrentWaitTime()
    }

    /**
     * 將當前角色卡切換至第一位，並關閉。
     */
    Scene_BirdsQuickSelector.prototype.closeSelector = function () {
        this._setPartyLeader()

        SceneManager.pop()
    }

    Scene_BirdsQuickSelector.prototype._setPartyLeader = function () {
        const newIndex = this._selectWindow.getIndex()

        if (this._party.index !== newIndex)
            $gameParty.swapOrder(0, newIndex)
    }



    //=============================================================================
    // 主窗口。
    //=============================================================================



    function Window_BirdsQuickSelector() {
        this.initialize(...arguments)
    }

    Window_BirdsQuickSelector.prototype = Object.create(Window_Base.prototype)
    Window_BirdsQuickSelector.prototype.constructor = Window_BirdsQuickSelector

    /**
     * 初始化 Window_BirdsQuickSelector 類。
     * 
     * @param {import("../rmmz_core.js").Rectangle} rect
     * @param {{order: GameActorList, index: number}} partyData 
     * @param {number} line
     */
    Window_BirdsQuickSelector.prototype.initialize = function (rect, partyData, line) {
        Window_Base.prototype.initialize.call(this, rect)

        this._initParames(partyData, line)
        this._drawArrow()
        this._drawActor(0)
    }

    /**
     * 參數初始化。
     * 
     * @param {Object} param0 
     * @param {GameActorList} param0.order
     * @param {number} param0.index
     * @param {number} line
     */
    Window_BirdsQuickSelector.prototype._initParames = function ({ order, index }, line) {
        this._party = {
            /** 開啟窗口時的隊伍資料集。 */
            order,
            /** 隊伍資料的長度。 */
            length: order.length,
            /** 目前所顯示角色的位置。 */
            nowIndex: index,
            /** 下一個要顯示角色的位置。 */
            nextIndex: index,
        }
        /** 窗口總行數。 */
        this._totalLine = line
        /**
         * 儲存每個角色所需要的 Sprites 類，以節省消耗。
         * 
         * @type { Sprite_Gauge[]}
         */
        this._partySprites = []
        /**
         * 兩側箭頭可見與否。
         * 
         * @type {[boolean, boolean]}
         */
        this._sideLoop = {
            both: [true, true],
            left: [true, false],
            right: [false, true],
            none: [false, false],
        }[_scrollLoop]
    }

    Window_BirdsQuickSelector.prototype._isLeftEnd = function () {
        return this._party.nowIndex === 0
    }

    Window_BirdsQuickSelector.prototype._isRightEnd = function () {
        return this._party.nowIndex === this._party.length - 1
    }

    Window_BirdsQuickSelector.prototype._isLeftLoop = function () {
        return this._sideLoop[0]
    }

    Window_BirdsQuickSelector.prototype._isRightLoop = function () {
        return this._sideLoop[1]
    }

    /**
     * 繪製窗口箭頭。
     */
    Window_BirdsQuickSelector.prototype._drawArrow = function () {
        this._setArrowSprites()
        const { right, left } = this._getArrowPosition()

        if (right) this._drawRightArrowImage(right)
        if (left) this._drawLeftArrowImage(left)
    }

    Window_BirdsQuickSelector.prototype._setArrowSprites = function () {
        this._rightArrow = new Sprite()
        this._leftArrow = new Sprite()

        this.addChild(this._rightArrow)
        this.addChild(this._leftArrow)
    }

    /**
     * 取得箭頭圖像的圖像與繪製座標。不顯示則為 `false` 。
     * 
     * @returns {{
     *   right: false | ArrowPosition
     *   left : false | ArrowPosition
     * }}
     */
    Window_BirdsQuickSelector.prototype._getArrowPosition = function () {
        const boxWidth = this._width
        const boxHeight = this._height
        const boxCenterY = boxHeight / 2
        const boxGap = 10

        /** 三角形底邊，等同於圖形中央留空的方形邊長。 */
        const arrowBottom = 24
        /** 三角形的高。 */
        const arrowHeight = arrowBottom / 2
        /** 四方向圖形中心的 X 軸 */
        const imageCenterX = 96 + arrowBottom * 2
        /** 四方向圖形中心的 Y 軸。 */
        const imageCenterY = 0 + arrowBottom

        let result = {
            right: false,
            left: false
        }

        if (!(this._isRightEnd() && !this._isRightLoop()))
            result.right = {
                displayX: boxWidth + boxGap,
                displayY: boxCenterY,
                imageX: imageCenterX + arrowHeight,
                imageY: imageCenterY + arrowHeight,
                imageW: arrowHeight,
                imageH: arrowBottom,
            }

        if (!(this._isLeftEnd() && !this._isLeftLoop()))
            result.left = {
                displayX: - boxGap,
                displayY: boxCenterY,
                imageX: imageCenterX - arrowBottom,
                imageY: imageCenterY + arrowHeight,
                imageW: arrowHeight,
                imageH: arrowBottom,
            }

        return result
    }

    /**
     * @param {ArrowPosition} param0 
     */
    Window_BirdsQuickSelector.prototype._drawRightArrowImage = function ({ displayX, displayY, imageX, imageY, imageW, imageH }) {
        this._rightArrow.bitmap = this._windowskin
        this._rightArrow.anchor.x = 0.5
        this._rightArrow.anchor.y = 0.5
        this._rightArrow.setFrame(imageX, imageY, imageW, imageH)
        this._rightArrow.move(displayX, displayY)
        this._rightArrow.show()
    }

    /**
     * @param {ArrowPosition} param0
     */
    Window_BirdsQuickSelector.prototype._drawLeftArrowImage = function ({ displayX, displayY, imageX, imageY, imageW, imageH }) {
        this._leftArrow.bitmap = this._windowskin
        this._leftArrow.anchor.x = 0.5
        this._leftArrow.anchor.y = 0.5
        this._leftArrow.setFrame(imageX, imageY, imageW, imageH)
        this._leftArrow.move(displayX, displayY)
        this._leftArrow.show()
    }

    /**
     * 繪製角色資訊。
     * 
     * @param {number} index 角色在隊伍中的順序。
     */
    Window_BirdsQuickSelector.prototype._drawActor = function (index) {
        if (typeof index !== "number") throw new Error("輸入參數不是數字。")

        this._setClear()
        const actor = this._getActor(index)

            ;[["hp", 2], ["mp", 3],].map(([type, line]) => this._setActorStatusGauge(actor, type, line))

        this.drawText(actor._name, 0, this._getLinePosition(1), this.innerWidth, "left")
        this.drawText(`Lv: ${actor._level}`, 0, this._getLinePosition(1), this.innerWidth, "right")
    }

    /**
     * 取得對應編號的隊伍成員資料。
     * 
     * @param {number} index 
     * @returns {GameActor}
     */
    Window_BirdsQuickSelector.prototype._getActor = function (index) {
        return this._party.order[index]
    }

    Window_BirdsQuickSelector.prototype._getLinePosition = function (line) {
        return this.lineHeight() * (line - 1)
    }

    /**
     * 
     * @param {GameActor} actor 
     * @param {number} index 
     */
    Window_BirdsQuickSelector.prototype._setActorStatusGauge = function (actor, type, line) {
        const dict = this._partySprites
        const sprite = new Sprite_BirdsQuickSelectorGauge(this.innerWidth)

        dict.push(sprite)
        this.addInnerChild(sprite)

        this._setSpriteGauge(sprite, actor, type, 0, this._getLinePosition(line))
    }

    Window_BirdsQuickSelector.prototype._setSpriteGauge = function (sprite, actor, type, x, y) {
        sprite.setup(actor, type)
        sprite.move(x, y)
        sprite.show()
    }

    Window_BirdsQuickSelector.prototype.setToNext = function () {
        this._party.nextIndex = this._isRightEnd()
            ? this._isRightLoop() ? 0 : this._party.nowIndex
            : this._party.nowIndex + 1
        this.refresh()
    }

    Window_BirdsQuickSelector.prototype.setToPrev = function () {
        this._party.nextIndex = this._isLeftEnd()
            ? this._isLeftLoop() ? this._party.length - 1 : 0
            : this._party.nowIndex - 1
        this.refresh()
    }

    Window_BirdsQuickSelector.prototype.getIndex = function () {
        return this._party.nowIndex
    }

    Window_BirdsQuickSelector.prototype._setClear = function () {
        this.contents.clear()
        this._partySprites.map(s => s.destroy())
        this._partySprites = []
    }

    // Window_ActorSelector.prototype.update = function () {
    //     Window_Base.prototype.update.call(this)
    // }

    Window_BirdsQuickSelector.prototype.refresh = function () {
        this._refreshActorData()
        this._refreshSideArrow()
    }

    Window_BirdsQuickSelector.prototype._refreshActorData = function () {
        if (this._party.nowIndex !== this._party.nextIndex) {
            this._party.nowIndex = this._party.nextIndex
            SoundManager.playOk()
            this._drawActor(this._party.nextIndex)
        }
    }

    Window_BirdsQuickSelector.prototype._refreshSideArrow = function () {
        this._getArrowPosition()
    }



    //=============================================================================
    // 體力、魔力條。為了更改圖形長度而另外繼承。
    //=============================================================================



    function Sprite_BirdsQuickSelectorGauge() {
        this.initialize(...arguments)
    }

    Sprite_BirdsQuickSelectorGauge.prototype = Object.create(Sprite_Gauge.prototype)
    Sprite_BirdsQuickSelectorGauge.prototype.constructor = Sprite_BirdsQuickSelectorGauge

    Sprite_BirdsQuickSelectorGauge.prototype.initialize = function (gaugeWidth) {
        Sprite_Gauge.prototype.initialize.call(this);

        this._extra_GaugeWidth = parseInt(gaugeWidth)
    }

    Sprite_BirdsQuickSelectorGauge.prototype.bitmapWidth = function () {
        return 266 // this._extra_GaugeWidth
    }



    //=============================================================================
    // 註冊進地圖更新循環中。
    //=============================================================================



    Input.keyMapper[_inputKeycode.toString()] = _inputName

    const _SceneMap_updateScene = Scene_Map.prototype.updateScene
    Scene_Map.prototype.updateScene = function () {
        _SceneMap_updateScene.call(this, arguments)

        if (!SceneManager.isSceneChanging())
            this.updateCallQuickSelector()
    }

    Scene_Map.prototype.updateCallQuickSelector = function () {
        if (Input.isPressed(_inputName))
            SceneManager.push(Scene_BirdsQuickSelector)
    }
})()
