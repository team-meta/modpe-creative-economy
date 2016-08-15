const BufferedReader_ = java.io.BufferedReader,
    File_ = java.io.File,
    FileInputStream_ = java.io.FileInputStream,
    FileOutputStream_ = java.io.FileOutputStream,
    InputStreamReader_ = java.io.InputStreamReader,
    Long_ = java.lang.Long,
    String_ = java.lang.String,
    Thread_ = java.lang.Thread,
    ScriptManager_ = net.zhuoweizhang.mcpelauncher.ScriptManager,
    PATH = "/sdcard/games/team.meta/creative_economy/",
    PLAYERS_PATH = "/sdcard/games/team.meta/creative_economy/players/",
    RADIAN = 0.017;



let recentTouchedPlayer = null;



Server.getAllEntities = () => {
    return Entity.getAll.filter(element => {
        return !Player.isPlayer(element);
    });
};

Server.getAllPlayers = () => {
    return Entity.getAll().filter(Player.isPlayer);
};

Server.getPlayer = () => {
    return recentTouchedPlayer;
};

Server.getPlayerByName = name => {
    let players = Server.getAllPlayers();
    for (let i = players.length; i--;) {
        let player = players[i];
        if (Player.getName(player) === name) {
            return player;
        }
    }
    return null;
};



function Bank() {

}



function Command(params) {
    this._params = params || [];
}

Command.FLAG_ALL = "@all";
Command.FLAG_ALL_SHORT = "@a";
Command.FLAG_ENTITIES = "@entities";
Command.FLAG_ENTITIES_SHORT = "@e";
Command.FLAG_PLAYERS = "@players";
Command.FLAG_PLAYERS_SHORT = "@our";
Command.FLAG_PLAYER = "@player";
Command.FLAG_PLATER_SHORT = "@me";

Command.prototype.run = function () {
    let params = this._params;
    if (params[i] in CommandList) {
        CommandList[params[i]](...params.splice(1));
    }
};

Command.prototype.setParams = function (arr) {
    this._params = arr;
    return this;
};



const CommandList = {
    help(page) {
        showMessage(["Hello world", "Hello", "World"][page || 1]);
    },
    info() {
        showMessage("Creative Economy Beta!");
    }
};



function CommandParser() {}

CommandParser.isValid = function (str) {
    return str.substring(0, 7) === "@Command";
};

CommandParser.parse = function (str) {
    let tmp = [],
        arr;
    str = str.replace(/".*"/g, $1 => {
        $1 = $1.substring(1, $1.length - 1);
        tmp.push($1);
        return "@tmp_" + (tmp.length - 1);
    });
    arr = str.split(" ");
    for (let i = arr.length; i--;) {
        let element = arr[i],
            elements = element.split("_");
        if (elements[0] === "@tmp") {
            element = tmp[elements[1]];
        }
        if (element[0] === "#") {
            arr[i] = Server.getPlayerByName(element.substring(1));
        } else if (element[0] === "@") {
            switch (element) {
            case Command.FLAG_ALL:
            case Command.FLAG_ALL_SHORT:
                arr[i] = Entity.getAll();
                break;
            case Command.FLAG_ENTITIE:
            case Command.FLAG_ENTITIES_SHORT:
                arr[i] = Server.getAllEntities();
                break;
            case Command.FLAG_PLAYERS:
            case Command.FLAG_PLAYERS_SHORT:
                arr[i] = Server.getAllPlayers();
                break;
            case Command.FLAG_PLATER:
            case Command.FLAG_PLATER_SHORT:
                arr[i] = Server.getPlayer();
            }
        } else if (/^[+-]?\d+(\.\d+)?$/.test(element)) {
            arr[i] = Number(element);
        } else if (element === "false" || element === "true") {
            arr[i] = Boolean(element);
        }
    }
    return new Command(arr);
};



function File(path) {
    this._path = path;
}

File.read = function (path) {
    let file = new File_(path);
    if (file.exists()) {
        let fis = new FileInputStream_(path),
            isr = new InputStreamReader_(fis),
            br = new BufferedReader_(isr),
            str = "",
            read = "";

        while ((read = br.readLine()) != null) {
            str += read + "\n";
        }
        br.close();

        return str;
    } else {
        File.write(path, "");
        return "";
    }
};

File.write = function (path, str) {
    let file = new File_(path),
        fos = new FileOutputStream_(path);

    file.getParentFile().mkdirs();
    fos.write(new String_(str).getBytes());
    fos.close();
};

File.prototype.read = function () {
    return File.read(this._path);
};

File.prototype.write = function (str) {
    File.write(this._path, str);
    return this;
};



function PlayerData(entity) {
    this._entity = entity;
    this._wallet = new Wallet(entity);
}

PlayerData.prototype.getEntity = function () {
    return this._entity;
};

PlayerData.prototype.getWallet = function () {
    return this._wallet;
};

PlayerData.prototype.setEntity = function (entity) {
    this._entity = entity;
    return this;
};

PlayerData.prototype.setWallet = function (wallet) {
    this._wallet = wallet;
    return this;
};

PlayerData.prototype.toJSON = function () {

};



function Preference() {
    this._pref = JSON.parse(File.read(PATH + "pref.json"));
}



function System() {
    this._isRunning = false;
}

System.prototype.add = function (player) {
    let players = this._players,
        uuid = Entity.getUniqueId(player);
    if (!(uuid in players)) {
        players[uuid] = new PlayerData(player);
    }
};

System.prototype.init = function () {
    let thiz = this,
        players = this._players = {},
        players_ = Server.getAllPlayers();
    for (let i = 0, len = players_.length; i < len; i++) {
        let player = players_[i],
            playerData = new PlayerData(player),
            uuid = Entity.getUniqueId(player),
            file = new File_(PLAYERS_PATH + uuid);
        if (file.exists()) {
            let obj = JSON.parse(File.read(file.getPath()));
            playerData.getWallet().setMoney(obj.wallet.money, "init");
        }
        players[uuid] = playerData;
    }
    this._isRunning = true;
    new Thread({
        run() {
            Thread_.sleep(60000);
            while (thiz._isRunning) {
                players = thiz._players;
                players_ = Server.getAllPlayers();
                for (let i = 0, len = players_.length; i < len; i++) {
                    let uuid = Entity.getUniqueId(players_[i]);
                    if (uuid in players) {
                        File.write(PLAYERS_PATH + uuid, JSON.parse(players[uuid].toJSON()));
                    }
                }
                Thread_.sleep(60000);
            }
        }
    }).start();
};

System.prototype.isRunning = function () {
    return this._isRunning;
};

System.prototype.save = function () {
    let players = this._players,
        players_ = Server.getAllPlayers();
    for (let i = 0, len = players_.length; i < len; i++) {
        let player = players_[i],
            playerData = new PlayerData(player),
            uuid = Entity.getUniqueId(player);
        if (uuid in players) {
            File.write(PLAYERS_PATH + uuid, JSON.parse(players[uuid].toJSON()));
        }
    }
    return this;
};

System.prototype.stop = function () {
    this._isRunning = false;
    return this;
};



function Wallet(owner, money) {
    this._log = new WalletLog();
    this._money = money || 0;
    this._owner = owner || null;
}

Wallet.prototype.addMoney = function (money, reason) {
    this._log.add({
        type: WalletLog.ADD_MONEY,
        lastValue: this._money,
        value: money,
        reason: reason || "None"
    });
    this._money += money;
    return this;
};

Wallet.prototype.getLog = function () {
    return this._log;
};

Wallet.prototype.getMoney = function () {
    return this._money;
};

Wallet.prototype.getOwner = function () {
    return this._owner;
};

Wallet.prototype.setLog = functuon(log) {
    this._log = log;
    return this;
};

Wallet.prototype.setMoney = function (money, reason) {
    this._log.add({
        type: WalletLog.SET_MONEY,
        lastValue: this._money,
        value: money,
        reason: reason || "None"
    });
    this._money = money;
    return this;
};

Wallet.prototype.setOwner = function (owner) {
    this._owner = owner;
    return this;
};

Wallet.prototype.subtractMoney = function (money, reason) {
    this._log.add({
        type: WalletLog.SUBTRACT_MONEY,
        lastValue: this._money,
        value: money,
        reason: reason || "None"
    });
    this._money -= money;
    return this;
};



function WalletLog() {
    this._log = [];
}

WalletLog.ADD_MONEY = 0;
WalletLog.SET_MONEY = 1;
WalletLog.SUBTRACT_MONEY = 2;

WalletLog.prototype.add = function (log) {
    this._log.push(log);
};

WalletLog.prototype.get = function (index) {
    return this._log[index];
};

WalletLog.prototype.getAll = function () {
    return this._log;
};

WalletLog.prototype.toJSON = function () {
    return JSON.stringify(this._log);
};

WalletLog.prototype.toString = function () {
    let logs = this._log,
        arr = [];
    for (let i = 0, len = logs.length; i < len; i++) {
        let log = logs[i];
        if (log.type === WalletLog.ADD_MONEY) {
            arr.push("add: " + log.lastValue + "->" + (log.lastValue + log.value) + " / reason: " + log.reason);
        } else if (log.type === WalletLog.SET_MONEY) {
            arr.push("set: " + log.lastValue + "->" + log.value + " / reason: " + log.reason);
        } else if (log.type === WalletLog.SUBTRACT_MONEY) {
            arr.push("subtract: " + log.lastValue + "->" + (log.lastValue - log.value) + " / reason: " + log.reason);
        }
    }
    return arr.join("\n");
};



function useItem(x, y, z, itemid, blockid) {
    let playerEntity = Player.getEntity();
    addPlayer(playerEntity);

    if (blockid == 63 || blockid == 68) {
        commandHook(Level.getSignText(x, y, z, 0) + Level.getSignText(x, y, z, 1) + Level.getSignText(x, y, z, 2) + Level.getSignText(x, y, z, 3));
    }
}

function attackHook(attacker, victim) {
    addPlayer(attacker);
    addPlayer(victim);
}

function deathHook(murder, victim) {
    addPlayer(murder);
    addPlayer(victim);
}

function entityHurtHook(attacker, victim) {
    addPlayer(attacker);
    addPlayer(victim);
}

function commandHook(str) {
    if (CommandParser.isValid(str)) {
        recentTouchedPlayer = playetEntity;
        str = str.substring(8);
        let cmds = str.split(/\s*&\s*/);
        for (let i = 0, len = cmds.length; i < len; i++) {
            CommandParser.parse(cmds[i]).run();
        }
    }
}

function addPlayer(player) {
    if (Player.isPlayer(player) && Entity.getAll().indexOf(player) !== -1) {
        ScriptManager_.allentities.add(Long_(player));
        ScriptManager_.allplayers.add(Long_(player));
        ScriptManager_.callScriptMethod("entityAddedHook", [player]);
    }
}

function showMessage(str) {
    let playerEntity = Server.getPlayer(),
        yaw = Entity.getYaw(playerEntity) * RADIAN,
        entity = Level.spawnMob(Entity.getX(playerEntity) + 1.5 * -Math.sin(yaw), Entity.getY(playerEntity), Entity.getZ(playerEntity) + 1.5 * Math.cos(yaw), 64);
    Entity.setNameTag(entity, str);
    new Thread_({
        run() {
            Thread_.sleep(10000);
            Entity.remove(entity);
        }
    }).start();
}