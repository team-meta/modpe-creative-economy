Entity.getAll = () => {
    // 고장났다고 전해짐. 고장났는지 확인하고 맞으면 새로 만드셈.
};

Server.getAllEntities = () => {
    // 플레이어 빼고 모든 엔티티 반환
};

Server.getAllPlayers = () => {
    // 모든 플레이어 반환
};

Server.getPlayer = () => {
    // 가장 최근에 표지판 터치한 사람 반환
    // useItem이랑 잘 연동해보셈
};

Server.getPlayerByName = name => {
    // 이름으로 플레이어 엔티티 찾기
};



function Bank() {

}



function Command(params) {
    this._params = params || [];
}

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
            case "@all":
            case "@a":
                arr[i] = Entity.getAll();
                break;
            case "@entities":
            case "@e":
                arr[i] = Server.getAllEntities();
                break;
            case "@players":
            case "@our":
                arr[i] = Server.getAllPlayers();
                break;
            case "@player":
            case "@me":
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



function Wallet() {}

Wallet.prototype.getMoney = function () {
    return this._money;
};

Wallet.prototype.getOwner = function () {
    return this._owner;
};

Wallet.prototype.setMoney = function (money) {
    this._money = money;
};

Wallet.prototype.setOwner = function (owner) {
    this._owner = owner;
};
