//=============================================================================
// Bird's Multiple Backpacks
//=============================================================================
// version 1.0.0
//=============================================================================
// 2021-08-06 - v1.0.0       - 最初版本。
//=============================================================================
/*:
 * @target MZ
 * @author 竹鳥
 * @plugindesc (1.0.0) 簡易多背包插件。
 * 
 * @help Bird_MultipleBackpacks.js
 * 
 * # 功能簡介
 * 
 * 這個插件讓製作者可以使用多個背包，透過插件指令切換。
 * 
 * @param default_name
 * @text 預設背包的名稱
 * @desc 這是當開始新遊戲時，第一個背包所使用的名字。
 * @type string
 * @default 0
 * 
 * @command use_change_backpack_by_variable
 * @text 切換至變數對應的背包
 * @desc 切換至變數對應的背包，如果不存在，則建立空背包。
 *
 * @arg variable_index
 * @text 變數編號
 * @desc 要使用的變數
 * @type variable
 * @default 1
 *
 * @command use_change_backpack_by_string
 * @text 切換至文字對應的背包
 * @desc 切換至文字對應的背包，如果不存在，則建立空背包。
 *
 * @arg backpack_name
 * @text 背包標籤
 * @desc 要使用的背包標籤。
 * @type string
 * @default 1
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
    const filename = "Bird_MultipleBackpacks"

    const Birds = Symbol.for("Bird_Plugins")
    const thisPlugin = Symbol.for(filename)

    const savaDataKey = `${Birds.description}_${thisPlugin.description}`


    // 取得使用者設定的插件參數
    const userParams = PluginManager.parameters(filename)

    const DEFAULT_BACKPACK_NAME = userParams["default_name"] && userParams["default_name"] !== ""
        ? userParams["default_name"]
        : "0"


    // 定義插件命令功能
    PluginManager.registerCommand(filename, "use_change_backpack_by_variable", args =>
        GameBackpack($gameVariables.value(args.variable_index)).useChange()
    )

    PluginManager.registerCommand(filename, "use_change_backpack_by_string", args =>
        GameBackpack(args.backpack_name).useChange()
    )


    // 儲存插件資料。
    window[Birds] = window[Birds] || {}
    window[Birds][thisPlugin] = window[Birds][thisPlugin] || {
        scriptName: filename,
        backpackData: 1,
    }



    //=============================================================================
    // 背包操作主函數。
    //=============================================================================



    function GameBackpack(key) {
        const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x)

        const getSave = () => window[Birds][thisPlugin].backpackData
        const setSave = allData => (
            window[Birds][thisPlugin].backpackData = allData,
            allData
        )

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

        const getDataByKeyOrDefault = def => data => data[key] || def

        const setNewUseingBackpack = () => {
            const now = getNowBackpack()
            const all = getSave()

            all[all.useing] = now
            all.useing = key

            return all
        }


        const useChange = pipe(
            setNewUseingBackpack,
            setSave,
            getDataByKeyOrDefault({ items: {}, weapons: {}, armors: {}, gold: 0 }),
            setNewBackpack
        )

        return {
            useChange: useChange,
        }
    }



    //=============================================================================
    // 在存檔中保存與取得插件狀態。
    //=============================================================================



    const DataManager_SetupNewGame = DataManager.setupNewGame
    const DataManager_MakeSaveContents = DataManager.makeSaveContents
    const DataManager_ExtractSaveContents = DataManager.extractSaveContents


    DataManager.setupNewGame = function () {
        DataManager_SetupNewGame.call(this)

        window[Birds][thisPlugin].backpackData = { useing: DEFAULT_BACKPACK_NAME }
    }

    DataManager.makeSaveContents = function () {
        const content = DataManager_MakeSaveContents()

        content[savaDataKey] = {
            backpackData: window[Birds][thisPlugin].backpackData,
        }

        return content
    }

    DataManager.extractSaveContents = function (content) {
        DataManager_ExtractSaveContents(content)

        window[Birds][thisPlugin].backpackData = content[savaDataKey].backpackData
    }

})()
