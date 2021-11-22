#programming #article/tutorial #RPGMaker 

# 前言

當 RPG Maker 改以 JavaScript 為遊戲語言之後，自認對 JS 有些許了解，我每隔一段時間便會興起加入 RM 圈，製作遊戲、撰寫插件的想法。

> 想來要做點小插件應該不是難事吧。

但現實殘酷，我總是沒辦法堅持下去（正因這一點，我相當偑服巴哈、Discord 上面各個正爆肝製作中或甚至已經完成過遊戲的人）。

JavaScript 大概是世界上最易於學習的語言之一了，然而要讀官方的程式邏輯與 JS 能力其實關聯不大——裡面用的寫法都很簡單，只是粗糙且不必要地複雜。只要有基礎，理應慢慢能懂。

那為什麼我還是會失敗放棄呢？要怎麼樣才能用簡單的程式，做出插件，修改預設功能？

我打算以我從全然不懂的 RM 新手，直到成功開始製作插件的這段經驗，寫點介紹與方法。需要注意的是，我在這以前已經學過了 JS ，我比較沒有「看不懂一段程式在做什麼」的困難。

如果你為了 RPG Maker 而開始學習 JavaScript ，正想知道如何在這裡中活用你的編程技能，那也許我可以給你一個參考起點。

如果你沒有 JavaScript 或其他語言的編程知識，那接下來可能會有相當多領域術語，如果遇到困難，無論如何都難以理解，那我建議可以先從語言本身開始學起（可以參考 [MDN](https://developer.mozilla.org/zh-TW/docs/Learn/JavaScript) 網站），這篇文章並不是語言教學。

如果你已經對編程語言有相當了解，但對 RPG Maker 的程式碼並不清楚，那從第二章開始應該可以作為參考。

如果你已經是插件界的老手……這篇文章是寫給新手看的喔，對你來說可能會有很多無趣、乏味的內容。

任何人發現了文章中的錯誤或想提供補充參考，小至文字誤鍵，大至觀點偏誤，我隨時歡迎指教。

# 1. 為什麼會失敗

當我反思自己在 RM 上屢屢放棄的主因，大概便是那長到嚇人的程式碼。一上來就是強大的心理壓力，實在吃不消。

讓我們計算一下每個檔案的行數，這些數字經過四捨五入，因為官方目前仍持續更新版本，它們隨時可能變化。

```
main           150
plugins          x
rmmz_core     6400
rmmz_manager  3100
rmmz_object  11300
rmmz_scenes   3600
rmmz_sprites  3700
rmmz_windows  6600
```

加總後近三萬五千行。就算我讀了，也記不住，怎麼辦呢？

如果你想透過官方文檔來學習程式碼，那可能要失望了。文檔中僅包含了 `rmmz_core.js` 6400 行程式，其餘部份一字未提，但那才是形塑 RM 系統的主要部份啊。

這就好像電腦的維修手冊上，居然是高中電學一樣。不，我想知道它的主控板、記憶體，乃至操作系統的規格。

而解方很簡單，就是別讀。

> 研究目錄頁，對這本書的基本架構做概括性的理解。這就像是在出發旅行之前，要先看一下地圖一樣。
> ——《如何閱讀一本書》P.42

在面對他人所寫的程式碼時，也同樣可以從目錄來大略了解它寫了什麼，不需要立刻就讀完上萬行程式碼，只要等到需要的時候，再以查詢百科全書的心態來探索就好。

# 2. 了解如何取值

當然，我們終究要讀一些程式。既然沒有看，知道自己要查什麼東西就變得很重要。

### 變數、開關與角色

在 `rmmz_object.js` 裡，可以看到像是：

- `Game_Variables`：控制遊戲變數。
- `Game_Switches`：控制遊戲開關。
- `Game_Actor`：控制遊戲角色。

所有這樣的單例，在執行期會被放入以 `$game` 開頭的變數中。你可以開啟一個專案，在測試運行的控制臺中察看。

至於我們在編輯器資料庫介面規劃的道具、角色等等設定，則是存放在以 `$data` 開頭的參數。

因此，我們能用如下的片段，在 RM 中玩 FizzBuzz ：

```js
(() => {
    // 取得１號變數。
    const value = $gameVariables.value(1)
    
    // 依據規則，返回數字對應的字串。
    function getValueSign(rules, value) {
        const res = Object
            .keys(rules)
            .reduce((res, key) => value % Number(key) === 0
                ? res + rules[key]
                : res
            , "")
        
        return res.length === 0 ? value.toString() : res
    }
    
    // 以上限值取得一段範圍的 FizzBuzz 字串。
    function getFizzBuzzByRange(limit) {
        const rules = {
            3: "Fizz",
            5: "Buzz",
        }    
        const getFizzBuzz = value => getValueSign(rules, value)
        
        return [...Array(limit)]
            .map((_, idx) => getFizzBuzz(idx + 1))
            .join("\n")
    }
    
    // 依據１號變數產生對應 FizzBuzz 字串。
    const result = getFizzBuzzByRange(value)
    
    // 設定２號變數。
    $gameVariables.setValue(2, result)
})()
```

### 如何找到自己需要的值

在 `rmmz_object.js` 中，我們可以找到大部份所需的東西，甚至是事件頁功能的對應函數也有。

而 `rmmz_scenes.js` 、 `rmmz_sprites.js` 、 `rmmz_windows.js` 三個檔案則是負責處理畫面、介面等等功能。這部份比較複雜些，不在本文的介紹範圍內。

你可以透過瀏覽大綱，以了解那些功能或事物在 RM 程式碼中的具體用詞，以便在遇到相關問題時知道以什麼關鍵字搜尋。

值得一提的是，那些事件功能對應的函數有部份可能並非那麼開箱即用，因為它們是以「在事件物件環境下執行」為前提而撰寫。

例如：若我想在執行 FizzBuzz 函數時立刻看到結果，又懶得再加顯示訊息的事件指令。但是直接使用顯示訊息的 `command101` 函數卻會報錯，因為它想提前看到下一條事件指令，以準備像是選擇項之類的情況。

於是我需要檢查訊息系統，並寫成這樣：

```js
(() => {
    // ...
    
    // 設定為滾動字幕
    $gameMessage.setScroll(5, false)
    // 加入至待處理的文字序列中。
    $gameMessage.add(result)
})()
```

# 範例１：清除畫面上的所有圖片

### 目標與猜想

假設我們製作的遊戲使用了大量圖片來組合成獨特的介面，這些圖片還可能因為條件不同，於是編號也不同。那當要關閉介面的時候怎麼辦？

僅管當然可以老老實實寫好幾條指令把圖片遂一關掉，但這樣既浪費效能、容易遺漏，如果要改介面，也不方便。

由於圖片的運作方式我們可以猜測，它可能是某種陣列。因為在編輯器中，我們只能透過「編號」來指定圖片，它沒有名稱標籤，而對於這類數據最簡單的方法就是陣列——它不會無緣無故用物件來裝以編號為鍵的東西，在範例２中我們可以看到另一個例子。

### 查找自己需要的程式段

既然是陣列，那一定有一個地方寫著 `變數名稱 = []` 。而程式中提到圖片的有兩個地方：

- `rmmz_manager.js` 的 `ImageManager`
- `rmmz_object.js` 的 `Game_Picture`

但整段瀏覽下來，`ImageManager` 其實是用來載入圖片檔案；`Game_Picture` 則是包裝圖片應該如何顯示的數據。

那就搜尋 `picture` 這個關鍵字吧。看樣子應該有個變數，會被用來裝一大堆 `Game_Picture` 才對。但圖片屬於遊戲執行過程中才逐一加入的物件，可能沒辦法用 `Game_Picture` 直接找到目標。

等等，`picture` 在 `rmmz_object.js` 居然使用了超過一百次？

我們可以發現除了 `Game_Picture` 之外，用最兇的是 `Game_Screen` ，而正好就在第一個搜索結果，我們有 `this.clearPictures();` 。

```js
Game_Screen.prototype.clearPictures = function () {
    this._pictures = [];
};
```

### 確認效果與保險起見

就是這個了，我們只需要調用 `$gameScreen.clearPictures()` ，遊戲在下一幀就會把圖片清除掉。

保險起見，讓我們再深入一點，萬一它在刪去圖片以前，還需要做什麼事情呢。

就在這段下方，寫著 `Game_Screen.prototype.eraseBattlePictures` ，這是用來清除戰鬥時的圖片，它十分簡單地用了 `Array.slice` 。

看來我們不用擔心太多，直接跳到第二個帶有 `erase` 的 `Game_Screen.prototype.erasePicture` ，這裡更是直接把對應元素設置為 `null` 而已。

所以沒問題，我們可以直接使用 `$gameScreen.clearPictures()` 來刪除所有圖片。安全、乾淨、無汙染。

# 小結：視為香料調味

就像上面的範例都可以使用事件的腳本選項執行，在許多功能中，編輯器都留下了可以寫「腳本（或者叫做 Snippet）」的空間，也許是在技能傷害公式、道具效果執行公共事件（又譯做一般事件）、條件判斷使用腳本等等。

如果編輯器裡面沒有我們需要的資料欄位——也許我們想讓主角的名字，依據武器裝備而不同——那也可以到武器的「注釋」欄位中定義，如 `<name:小明>` （如果冒號後面有空格，也會一併包含進去），並用 `$dataWeapons[武器編號].meta` 得到 `{name: "小明"}`。

只要能夠活用這些功能，就能簡化許多原本需要複雜過程的做法，提供更多可能。

---

# 3. 整合零碎片段

但是當我們將程式碼隨手撒在遊戲的每個角落，雖然方便，也運行正常，等到要改動的時候便麻煩了。小遊戲還好，可是隨作品越來越大，要找到特定內容就會逐漸困難。

如果我現在想要「在執行清除全部圖片之後，添加其他操作」，然而光介面就有十幾個事件，分散於上百張地圖，找都找不到，何況是修改。

### 統一修改

就好像我們將功能包裝為函數，是為了重覆使用，我們也可以把常用的語句包裝起來，使用時，就調用包裝後的函數名稱，而非再寫一遍。

但是我們應該定義在哪裡呢？編輯器中沒有地方可以定義全域函數。

這就要利用 RM 的插件系統了。這套插件系統其實很粗糙，就只是讀取了檔案之後直接執行而已，我們可以直接在插件中添加全域函數。

讓我們開一個檔案，也許叫 `functions.js` ，像下面這樣：

```js
// functions.js
function clearAllPicture() {
    // ...
    $gameScreen.clearPictures()
    // ...
}
```

接著放入插件欄位，就可以直接使用 `clearAllPicture()` ，也能簡單地添加功能了。

### 以指令形式使用

在事件中寫 JavaScript 其實不太安全，它畢竟沒有語法提示、高亮等功能，不夠熟悉很可能會有錯字，想要保險，還得回到 VScode 之類的編輯器去寫。

此時做成插件指令就會是更好的選擇，在 MZ 中，不像 MV 仍需要一個字一個字輸入，MZ 可以用簡單的介面操作、選擇，而且也有不同的高亮提示，比一片灰的腳本段好讀很多。

要於 `functions.js` 加入指令列表非常容易，不一定要讀官方的註解系統介紹，你也可以複製預設插件或任何其它插件上方的注解整理為樣版，像這樣：

```js
/*:
 * @target MZ
 * @author 作者名稱
 * @plugindesc 檔案概述
 *
 * @help 檔案詳細介紹。
 *
 * @param 插件參數的程式內名稱
 * @text 插件參數在編輯器的顯示名稱
 * @desc 參數描述
 * @type 參數類型
 * @default 預設值
 * 
 * @command 指令在程式中用的名稱
 * @text 指令在編輯器中顯示的名稱
 * @desc 指令概述（因為編輯器視窗限制，只有兩行能夠顯示出來）。
 *
 * @arg 上面最後一個指令的參數名稱
 * @text 顯示名稱
 * @desc 參數概述（與指令概述一樣，只有兩行能夠顯示出來）。
 * @type 參數類型
 * @default 預設值
 */
```

稍微調整一下，讓它符合我們的需求，並且把我們剛才的函數註冊進插件指令系統裡：

```js
// functions.js
/*:
 * @target MZ
 * @author 竹鳥
 * @plugindesc 快速函數集。
 *
 * @help 
 * 指令列表：
 * 
 * — clearAllPicture：清除所有圖片
 * 
 * @command clearAllPicture
 * @text 清除所有圖片
 * @desc 先做點別的事情，接著清除所有圖片。
 */

// 用箭頭函數包裝，這樣就不用再汙染全局命名空間了。
(() => {
    // 這個參數需要保持與檔名一致，這樣指令系統才讀得到。
    const filename = "functions"
    
    // 我們忙了一段時間的函數。
    function clearAllPicture() {
        // ...
        $gameScreen.clearPictures()
        // ...
    }
    
    // 註冊進插件指令系統。
    PluginManager.registerCommand(filename, "clearAllPicture", clearAllPicture)
})()
```

# 範例２：多背包插件

現在我們知道一個插件大概的模樣了：編輯器註解、註冊插件系統，還有功能本身。理論上，我們已經足以寫出自己的插件，不過第一次總是不太熟悉。就讓我們以一個簡單的功能來嘗試看看吧。

這次不是把事件腳本裡的片段摘出來變成插件了，我們將從頭開始。

### 確定目標與使用方法

假設我們有個遊戲，玩家需要在多個視角之間切換，可角色都換了，背包卻像超次元空間袋一樣共用，這實在不太合理。

首先，讓我們先只專注在「切換背包」這方面。不處理角色，以免功能太複雜。

限制目標很重要，即使龐大如 YEP ，也仍然是由多個小功能去組成一個大型單一插件。我們隨時可以把自己寫的插件整合成一個檔案，但若是一開始就把全部的功能混在一起寫，不僅可能難以切割分類，目標太大也容易讓人失去動力——就像我當初面對上萬行程式碼時一樣。

我打算讓使用者可以用「變數」與「直接指定文字」來切換，因為這是最簡單的形式，我們在前面也提過了取得變數的方法。

至於儲存背包資料，則是直接在存檔裡多寫一個屬性。不使用變數來存，是因為我們終究需要在玩家保存時一併儲存背包狀態，若想不涉及存檔系統，我們就得在發生任何更動時都保存進變數中，那也太麻煩、太浪費效能了。

### 探索程式碼

不過在真正動筆以前，我們需要知道自己將處理什麼東西。遊戲裡的背包如何儲存、如何使用？畫面圖片使用了陣列來裝 `Game_Picture` 類，背包也是如此嗎？

首先，按照前文查詢程式碼的經驗，我們可以先從 `rmmz_objects.js` 開始。

`Game_Item` 是個非常明顯的目標，就如同 `Game_Picture` 一樣， `Game_Item` 也是用來保存單個道具資訊的類，不過這裡的「Item」含義更廣泛，從技能、武器與道具，全都涵蓋其中。

同樣搜尋 `_item` ，可以在最底下那幾個結果找到 `Game_Party` ，程式將所有道具都存在裡面，我們有熟悉的初始化函數：

```js
Game_Party.prototype.initAllItems = function () {
    this._items = {};
    this._weapons = {};
    this._armors = {};
};
```

幾乎就是 `Game_Screen.prototype.clearPictures` 的翻版，只不過這裡它改成了物件。

我們可以再往下找一點，從「程式碼如何使用它」來推測物件內部結構，不過這次就稍微偷懶一點，直接在遊戲裡看吧：

![RMMZ 示意圖：給予道具](../assert/RMMZ%20示意圖：給予道具.png)

如圖可見，`_items` 是個鍵與值均為數字的物件，鍵代表道具編號、值代表持有數量。

我們再做個測試，只要改了它的值，道具欄也會一同變化（不過需要退出重進，因為道具欄不是直接使用這個數據）。

###### 關鍵道具

仔細看看，裡面似乎沒有關鍵道具？

這是因為關鍵道具（`keyItem`）也是道具（`item`）的一種，如果深入去尋找關鍵道具究竟如何在道具欄中顯示，那我們會發現，「一般道具」、「關鍵道具」、「隠藏道具Ａ」與「隠藏道具Ｂ」只是在 `Game_Item.itypeId` 的值有所不同而已。

###### 存檔系統

至於存檔資料則是由 `DataManager` 所處理，在這裡為避免太過瑣碎，我就不詳細講述了，有興趣可以根據後文的程式碼來了解。

### 實現功能

為了從 `Game_Party` 中取值與賦值，我們先從以下函數開始。這部份雖然看起來很長很複雜，但這只是因為我把每個步驟都切割開來了，如果只看函數名稱，我相信會簡單很多：

```js
function GameBackpack(key) {
    const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x)
    
    // 從插件專用參數中獲取與儲存背包資料。
    const getSave = () => window[Birds][thisPlugin].backpackData
    const setSave = allData => (
        window[Birds][thisPlugin].backpackData = allData,
        allData
    )
    
    // 從 `Game_Party` 中獲取與儲存資料。
    const getNowBackpack = () => ({
        items: $gameParty._items,
        weapons: $gameParty._weapons,
        armors: $gameParty._armors,
        gold: $gameParty._gold,
    })
    const setNewBackpack = newBackpack => {
        $gameParty._items = newBackpack.items
        $gameParty._weapons = newBackpack.weapons
        $gameParty._armors = newBackpack.armors
        $gameParty._gold = newBackpack.gold
        
        return newBackpack
    }
    
    // 返回標籤在資料中對應的值，不存在則使用預設㥀。
    const getDataByKeyOrDefault = def => data => data[key] || def
    
    // 合併目前的背包狀態。
    const getAllBackpack = () => {
        const now = getNowBackpack()
        const all = getSave()

        return Object.assign({}, all, { [all.useing]: now })
    }

    // 更新使用中背包的標籤。
    const setNewUseingKey = all =>
        Object.assign({}, all, { useing: key })
    
    // 更換背包。
    const useChange = pipe(
        getAllBackpack,
        setNewUseingKey,
        setSave,
        getDataByKeyOrDefault({ items: {}, weapons: {}, armors: {}, gold: 0 }),
        setNewBackpack
    )
    
    // 儲存目前狀態。
    const useSaveAll = pipe(
        getAllBackpack,
        setSave,
    )
    
    return {
        useChange: useChange,
        useSaveAll: useSaveAll,
    }
}
```

其中第一個 `pipe` 函數在前文從沒出現過，對一些人來說可能較為複雜，不過一旦展開討論，便又會是另一篇長文，還請允許我跳過不提——只要知道它能返回一個函數，讓做為參數的函數按順序執行就可以了。

至於 `window[Birds][thisPlugin]` 則是用來管理與儲存我的每個插件，以避免它們和其他人所寫的插件混在一起，彼此干擾。你也可以換成任何你喜歡的位置，我只是為了以防萬一。

接著，修改存檔函數，讓我們將背包資料也裝進存檔中：

```js
const DataManager_SetupNewGame = DataManager.setupNewGame
const DataManager_MakeSaveContents = DataManager.makeSaveContents
const DataManager_ExtractSaveContents = DataManager.extractSaveContents

// 當建立新遊戲時，重置背包資料。
DataManager.setupNewGame = function () {
    DataManager_SetupNewGame.call(this)
    
    window[Birds][thisPlugin].backpackData = { useing: DEFAULT_BACKPACK_NAME }
}

// 當保存時，將背包存入存檔中。
DataManager.makeSaveContents = function () {
    const content = DataManager_MakeSaveContents()
    
    GameBackpack().useSaveAll()
    
    content[savaDataKey] = {
        backpackData: window[Birds][thisPlugin].backpackData,
    }
    
    return content
}

// 當讀取存檔時，以存檔內的資料覆蓋目前資料。
DataManager.extractSaveContents = function (content) {
    DataManager_ExtractSaveContents(content)
    
    window[Birds][thisPlugin].backpackData = content[savaDataKey].backpackData
}
```

最後，讓我們把這些功能與編輯器插件系統結合在一起：

```js
/**
 * 檔案名稱。
 * 
 * 如果你有更改檔名，請保持這個值與檔名一致，否則無法讀取到插件參數。
 */
const filename = "Bird_MultipleBackpacks"

const Birds = Symbol.for("Bird_Plugins")
const thisPlugin = Symbol.for(filename)
const savaDataKey = `${Birds.description}_${thisPlugin.description}`

// 取得使用者設定的插件參數
const userParams = PluginManager.parameters(filename)

const DEFAULT_BACKPACK_NAME = userParams["defaultName"] && userParams["defaultName"] !== ""
    ? userParams["defaultName"]
    : "1"

// 定義插件命令功能
PluginManager.registerCommand(filename, "useChangeBackpackByVariable", args =>
    GameBackpack($gameVariables.value(args.variableIndex)).useChange()
)

PluginManager.registerCommand(filename, "useChangeBackpackByString", args =>
    GameBackpack(args.backpackName).useChange()
)

// 儲存插件資料。
window[Birds] = window[Birds] || {}
window[Birds][thisPlugin] = window[Birds][thisPlugin] || {
    scriptName: filename,
    backpackData: null,
}
```

以及加上讓編輯器能讀懂的標記：

```js
/*:
 * @target MZ
 * @author 竹鳥
 * @plugindesc (1.0.0) 簡易多背包插件。
 * 
 * @help 
 * 
 * # 功能簡介
 * 
 * 單純讓使用者可以透過插件指令切換使用不同背包。
 * 
 * @param defaultName
 * @text 預設背包的名稱
 * @desc 這是當開始新遊戲時，第一個背包所使用的名字。
 * @type string
 * @default 1
 * 
 * @command useChangeBackpackByVariable
 * @text 切換至變數對應的背包
 * @desc 切換至變數對應的背包，如果不存在，則建立空背包。
 *
 * @arg variableIndex
 * @text 變數編號
 * @desc 要使用的變數
 * @type variable
 * @default 1
 *
 * @command useChangeBackpackByString
 * @text 切換至文字對應的背包
 * @desc 切換至文字對應的背包，如果不存在，則建立空背包。
 *
 * @arg backpackName
 * @text 背包標籤
 * @desc 要使用的背包標籤。
 * @type string
 * @default 1
 */
```
 
 完成！
 
 若想查看完整插件，你可以前往我在個人小屋中的[分享文章](https://home.gamer.com.tw/artwork.php?sn=5319329)。如果未來我有更新或除錯，將僅修改那篇插件文，不會同步訂正此處。

# 結語

這樣一來，我們就已經寫好一個插件了。也許我無法讓你成為撰寫大型戰鬥系統插件的大神，但至少現在，我希望可以讓你知道如何找到需要的東西，並且更順利地開始學習製作自己的作品。

因此，本文到此結束，祝你旅途愉快。

# 備註：編程工具包

也許你會覺得，「等等，這程式碼寫的都是什麼鬼？」

我確實聽過關於箭頭函數、三元運算符等簡寫需要熟悉才能快速理解的說法，而新手可能沒有太多接觸經驗，甚至可能根本沒有聽說過。這也是為什麼我寫了註解，希望讓讀者可以不用深入也能了解內容。

沒錯，我是故意的（雖然這確實是我平常的寫法）。我沒有用簡單易懂的 `while + if` 來處理循環邏輯判斷，而是把循環內容獨立為單一函數，還用了 `Array.reduce + => + ?:` 這種大雜燴。

對於 FizzBuzz 來說，它似乎過度複雜，官方程式碼也極少這麼寫。

這是因為我想突顯「編程風格」這個問題。僅管 FizzBuzz 只是個邏輯簡單、直接的題目，但仍然可以有多種不同的思路與解法，更別說是網路上各個插件作者想解決的問題了。

當我們想要處理困難問題，勢必得參考其他人的做法，從他人的插件中學習。因此，能夠看懂他人的思考方向相當重要，函數導向或物件導向只是個最粗淺的區分，但也是相對大眾化的起點。

而除了用來看懂別人的程式以外，各種「ＸＸ導向」也都只是種工具而已。

只有在畫家「知道」為什麼他要使用粉彩、漆墨時，這些表現手法才能產生意義；如果程式員敲下鍵盤，不是因為他知道在所有選擇中這種做法最為適當，而是因為他「只知道這麼寫」，那他遲早會遇到「理髮師難題」——超出了工具的極限。

有些問題以函數導向風格處理起來十分簡潔明暸，有些則更適合物件導向風格，強行使用不適合的工具，就像用鎯頭轉鏍絲一樣。

在這種情況下，我想，若能在平時就累積多種工具，寫起插件也能更順暢吧。

# 備註：不同的 FizzBuzz

以下我另外列出了三種 FizzBuzz 問題的解決方法， 使用各種不同的語言元素，按照難度排序，充作〈備註：編程工具包〉的補充範例。

JS 十分自由，沒有特別在語言規範層面遵循某種範式或寫法。不像 C# 與 JAVA 專為物件導向而設計，也不像 Haskell 、 Elm 專為函數導向而設計，更不存在如 Python 的 Python 之禪，因此每個人所寫的程式，可能會有不小區別。

以初學者來說，如果看不懂也十分正常。你可以放心跳過，或者藉由標題處的關鍵字來查詢了解——既然放在備註，它便並非屬於「不會就寫不了插件」的內容。

### Class/while

```js
class FizzBuzz {
    constructor(rules, matchMethod) {
        this._rules = {
            map: rules,
            key: Object.keys(rules),
        }        
        this._match = matchMethod
    }
    
    getMapStringByNumber(num) {
        return this._rules.key
            .reduce((res, key) => this._match(num, key)
                ? (res || "") + this._rules.map[key]
                : res
            , null) || num.toString()
    }
    
    getMapStringByRange(num) {
        let result = ""
        
        while(num > 0){
            result = this.getMapStringByNumber(num) + "\n" + result
            num--
        }
        
        return result
    }
}


const limit = $gameVariables.value(1)
const rules = {
    3: "Fizz",
    5: "Buzz",
}

function method(a, b){
    return a % b === 0
}


const fizzBuzz = new FizzBuzz(rules, method)
const result = fizzBuzz.getMapStringByRange(limit)
$gameVariables.setValue(2, result)
```

### Map/for of

```js
const limit = $gameVariables.value(1)
const rules = new Map()
rules.set(v => v % 3 === 0, "Fizz")
rules.set(v => v % 5 === 0, "Buzz")


function fizzBuzz(num, ruleMap) {
    let res = ""
    
    for(let i = 1; i <= num; i++) {
        let str = ""
        
        for(method of ruleMap.keys())
            if (method(i)) str += ruleMap.get(method)
             
        res += (str === "" ? i.toString() : str) + "\n"
    }
    
    return res
}


const result = fizzBuzz(limit, rules)
$gameVariables.setValue(2, result)
```

### 遞歸

```js
const limit = $gameVariables.value(1)
const rules = {
    3: "Fizz",
    5: "Buzz",
}


function fizzBuzz(limit, rules) {
    const keys = Object.keys(rules)
    const matchMethod = num => (res, key) => num % key === 0
        ? res + rules[key]
        : res
    
    const recGetMapString = (num, res = "") => {
        if (num <= 0) return res
        
        const str = keys
            .reduce(matchMethod(num), "")
        
        return recGetMapString(
            num - 1,
            `${str === "" ? num.toString() : str}\n${res}`)
    }
    
    return recGetMapString(limit)
}


const result = fizzBuzz(limit, rules)
$gameVariables.setValue(2, result)
```
