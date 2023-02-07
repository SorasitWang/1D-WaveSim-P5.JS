class Vec2 {

    constructor(pos) {
        if (typeof (pos) === "number")
            this.val = [pos, pos]
        else // list
            this.val = pos
    }

    size() {
        return Math.sqrt(this.val[0] * this.val[0] + this.val[1] * this.val[1])
    }

    addVec2(v) {
        this.val[0] += v.val[0]
        this.val[1] += v.val[1]
    }
}

function subVec2(v1, v2) {
    return new Vec2([v1.val[0] - v2.val[0], v1.val[1] - v2.val[1]])
}

function addVec2(v1, v2) {
    return new Vec2([v1.val[0] + v2.val[0], v1.val[1] + v2.val[1]])
}
function normalizeVec2(v) {

    return new Vec2([v.val[0] / v.size(), v.val[1] / v.size()])
}

function modVec2(v1, v2) {
    let v3 = subVec2(v1, v2)
    return v3.size()
}

function mulSc(v, sc) {
    return new Vec2([v.val[0] * sc, v.val[1] * sc])
}

function dotVec2(v1, v2) {
    return v1.val[0] * v2.val[0] + v1.val[1] * v2.val[1]
}
function mulVec2(v1, v2) {
    return new Vec2([v1.val[0] * v2.val[0], v1.val[1] * v2.val[1]])
}
function crossVec2(v1, v2) {
    return new Vec2([v1.val[0] * v2.val[1] - v1.val[1] * v2.val[0]])
}
function normalVec2(v1, v2) {
    let dx = v2.val[0] - v1.val[0]
    let dy = v2.val[1] - v1.val[1]
    return normalizeVec2(new Vec2([-dy, dx]))
}
function angleBetweenVec2(v1, v2) {
    return Math.acos(dotVec2(v1, v2) / (v1.size() * v2.size()))
}