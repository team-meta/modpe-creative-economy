const BufferedReader_ = java.io.BufferedReader,
    File_ = java.io.File,
    FileInputStream_ = java.io.FileInputStream,
    FileOutputStream_ = java.io.FileOutputStream,
    InputStreamReader_ = java.io.InputStreamReader,
    Long_ = java.lang.Long,
    String_ = java.lang.String,
    ScriptManager_ = net.zhuoweizhang.mcpelauncher.ScriptManager,
    PATH = "/sdcard/games/team.meta/creative_economy/";



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

Command.prototype.setParams = function (arr) {
    this._params = arr;
    return this;
};



function CommandParser() {}

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
}

PlayerData.prototype.getEntity = function () {
    return this._entity;
};



function Preference() {
    this._pref = JSON.parse(File.read(PATH + "pref.json"));
}



function Wallet() {}

Wallet.prototype.getMoney = function () {
    return this._money;
};

Wallet.prototype.getOwner = function () {
    return this._owner;
};

Wallet.prototype.setMoney = function (money) {
    this._money = money;
    return this;
};

Wallet.prototype.setOwner = function (owner) {
    this._owner = owner;
    return this;
};



function useItem(x, y, z, itemid, blockid) {
    let playerEntity = Player.getEntity();
    addPlayer(playerEntity);

    if (blockid == 63 || blockid == 68) {
        recentTouchedPlayer = playetEntity;
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

function addPlayer(player) {
    if (Player.isPlayer(player) && Entity.getAll().indexOf(player) !== -1) {
        ScriptManager_.allentities.add(Long_(player));
        ScriptManager_.allplayers.add(Long_(player));
        ScriptManager_.callScriptMethod("entityAddedHook", [player]);
    }
}