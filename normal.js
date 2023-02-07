const prevSurface = [], col = []
const INV_SURFACE_RESOL = 1 / SURFACE_RESOL
const velocityField = [], sourceField = [], obstacleField = []
const SCALE_WHEEL = 0.1
let circleRad = 50, circleRad2 = circleRad * circleRad
let mousePos = new Vec2([0, 0])

let state = 0
let colDir = 0
let waveType = 0
const surfaces = []

let updateDir = 1
const box1 = new Box(new Vec2([W / 4, 100]), w = W / 8, h = 150)
const box2 = new Box(new Vec2([3 * W / 4, 250]), w = W / 6, h = 100)
const pond = new ContSurfaces(300, 100, [])
function setup() {
    noCursor();
    frameRate(30)
    createCanvas(W, H);
}

function draw() {

    background(220);
    noFill()
    keyDown()
    //ellipse(mouseX,mouseY,2*circleRad,2*circleRad)
    pond.objsCol.forEach(objCol => {
        const box = objCol.obj
        rect(box.pos.val[0] - box.w, box.pos.val[1] - box.h, 2 * box.w, 2 * box.h);
    })

    //console.log(surfaces[0].resol)

    pond.clearExt()

    for (let s = pond.surfaces.length - 1; s >= 0; s--)
        update(s, -1)


    for (let s = 0; s < pond.surfaces.length; s++)
        update(s, 1)
    pond.retainSubSurface()
    //updateDir *= -1


    //console.log(pond.surfaces[2].extRight)
    //draw
    for (let s = 0; s < pond.surfaces.length; s++) {

        const surface = pond.surfaces[s]
        for (let i = 0; i < surface.resol; i++) {

            fill(0)
            ellipse(surface.IX(i), surface.surface[i], 4, 4)
            if (state === 0 && surface.sourceField[i] !== 0) {
                fill(255, 0, 0)
                ellipse(surface.IX(i), surface.normalLevel + surface.sourceField[i], 4, 4)
            }
        }
    }


}

function update(s, dir) {

    const surface = pond.surfaces[s]
    // if (!surface) console.log(pond.surfaces,s,surface)
    //try {
    if (state === 0) {
        //surface.clearValue()
        setSourceField(surface)
    }
    else {

        updateSurface1(surface, deltaTime, 0)
        surface.updateObs()
        surface.updatePrev()
        surface.clearSource()

        pond.oneAffectOther(s, dir)

    }
    //}
    // catch (error){
    //   //console.log("update",surface)
    // }
}
function mouseClicked() {
    state = (1 - state)
}
function mouseMoved() {
    mousePos = new Vec2([mouseX, mouseY])
}
// function keyTyped() {
//   if (key === 's') {
//      box1.pos.val[1] += 10
//     box2.pos.val[1] += 10
//    } 
//    else if (key === 'w') {
//      box1.pos.val[1] -= 10
//     box2.pos.val[1] -= 10
//    } 
//   // uncomment to prevent any default behavior
//   // return false;
// }

function keyDown() {
    // 's'
    if (keyIsDown(83)) {
        box1.pos.val[1] += 2
        box2.pos.val[1] += 2
    }
    // 'w'
    else if (keyIsDown(87)) {
        box1.pos.val[1] -= 2
        box2.pos.val[1] -= 2
    }
    // uncomment to prevent any default behavior
    // return false;
}

function mouseWheel(event) {
    //move the square according to the vertical scroll amount
    circleRad -= event.delta * SCALE_WHEEL
    circleRad = max(0, circleRad)
    circleRad2 = circleRad * circleRad
    //uncomment to block page scrolling
    //return false;
}
function inCircle(pos, surface) {
    const trulyIn = subVec2(pos, mousePos).size() < circleRad
    const dirCorrect = colDir === -1 ?
        mouseY < surface.normalLevel : mouseY > surface.normalLevel
    if (dirCorrect && abs(mouseY - surface.normalLevel) < circleRad) {
        if (abs(pos.val[0] - mouseX) < circleRad)
            return true
        else
            return false

    }
    return trulyIn
}


function setSourceField(surface) {
    let colAny = false
    for (let i = 0; i < surface.resol; i++) {
        const pos = new Vec2([surface.IX(i), surface.normalLevel])
        if (inCircle(pos, surface)) {
            colAny = true
            if (colDir === 0)
                colDir = mouseY < surface.normalLevel ? 1 : -1
            surface.sourceField[i] = colDir * sqrt(circleRad2 -
                pow(surface.IX(i) - mouseX, 2)) + mouseY - surface.normalLevel
        }
        else {
            surface.sourceField[i] = 0
        }
    }
    if (!colAny)
        colDir = 0 // reset
}


