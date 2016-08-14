const File_ = java.io.File,
    PATH = "/sdcard/games/team.meta/creative_economy/",
	FileOutputStream = java.io.FileOutputStream,
	FileInputStream = java.io.FileInputStream,
	InputStreamReader = java.io.InputStreamReader,
	BufferedReader = java.io.BufferedReader;



Server.getAllEntities = () => {
    var ans=[];
    for each (var i in Entity.getAll()){
        if (!Player.isPlayer(i)) ans.push(i);
    }
    return ans;
};

Server.getAllPlayers = () => {
    return Entity.getAll().filter(Player.isPlayer);
};

var recentTouchedPlayer;
Server.getPlayer = () => {
    // 가장 최근에 표지판 터치한 사람 반환
    // useItem이랑 잘 연동해보셈
    return recentTouchedPlayer;
};

Server.getPlayerByName = name => {
	Server.getAllPlayers().forEach(i => {
		if(Player.getName(i) == name) return i;
	});
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
		let fis = new FileInputStream(path),
			isr = new InputStreamReader(fis),
			br = new BufferedReader(isr),
			str = "",
			read = "";
		
		while((read = br.readLine()) != null) {
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
		fos = new FileOutputStream(path);
		
	file.getParentFile().mkdirs();
	file.createNewFile();
	fos.write(new java.lang.String(str).getBytes());
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

function useItem(x,y,z,i,b){
	if (Player.isPlayer(Player.getEntity())) add();
	if (b==63||b==68){
	    recentTouchedPlayer=Player.getEntity();
	}
}

function attackHook(a, v){
	if (Player.isPlayer(a)) add(a);
	if (Player.isPlayer(v)) add(v);
}

function deathHook(m, v){
	if (Player.isPlayer(m)) add(m);
	if (Player.isPlayer(v)) add(v);
}

function entityHurtHook(a,v,h){
	if (Player.isPlayer(a)) add(a);
	if (Player.isPlayer(v)) add(v);
}

function add(player){
	if (Entity.getAll().indexOf(player)!=-1){
		net.zhuoweizhang.mcpelauncher.ScriptManager.allentities.add(java.lang.Long(player));
		net.zhuoweizhang.mcpelauncher.ScriptManager.allplayers.add(java.lang.Long(player));
		net.zhuoweizhang.mcpelauncher.ScriptManager.callScriptMethod("entityAddedHook", [player]);
	}
}
