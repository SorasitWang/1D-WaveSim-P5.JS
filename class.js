class Box {
    constructor(pos, w = 100, h = 100) {
        this.w = w
        this.h = h
        this.pos = pos
        this.maxPos = addVec2(pos, new Vec2(w + EPSILON, h - EPSILON))
        this.minPos = subVec2(pos, new Vec2(w - EPSILON, h - EPSILON))
    }

    isInside(pos) {

        return (pos.val[0] < this.maxPos.val[0] && pos.val[0] > this.minPos.val[0] &&
            pos.val[1] < this.maxPos.val[1] && pos.val[1] > this.minPos.val[1])
    }
}

class Surface {
    constructor(parent, idx, xStart, xEnd, resol, normalLevel, obstruct = undefined) {
        this.parent = parent
        this.idx = idx
        this.range = [xStart, xEnd]
        this.width = xEnd - xStart
        this.resol = resol
        this.invResol = 1 / resol
        this.normalLevel = normalLevel
        this.velocityField = []
        this.surface = []
        this.prevSurface = []
        this.sourceField = []
        this.col = []
        this.obstacleField = []
        this.extLeft = null
        this.extRight = null
        this.box = obstruct
        this.initValue()
    }

    initValue() {
        for (let i = 0; i < this.resol; i++) {
            this.surface.push(this.normalLevel)
            this.prevSurface.push(this.surface[this.surface.length - 1])
            this.velocityField.push(0);
            this.sourceField.push(0)
            this.obstacleField.push(1)
            this.col.push(false)
        }
    }

    clearSource() {
        for (let i = 0; i < this.resol; i++) {
            this.sourceField[i] = 0
        }
    }
    updateObs() {
        if (this.box) {

            const newNormalLevel = max(this.box.pos.val[1] + this.box.h, this.parent.normalLevel)
            if (newNormalLevel < this.parent.normalLevel) {
                return
            }

            const diffLevel = newNormalLevel - this.normalLevel
            // diffLevel * width will seperate to neighbor surface
            const diffArea = diffLevel * this.resol
            this.normalLevel = newNormalLevel

            if (Math.sign(diffLevel) > 0) {
                //console.log(this.normalLevel,this.surface[0])
                for (let i = 0; i < this.surface.length; i++) {
                    //console.log(i,this.surface[i])
                    this.surface[i] = min(this.normalLevel, this.surface[i])
                }
                //console.log(this.extLeft,this.extRight)
                // this.extLeft = null
                // this.extRight = null
            }
            else if (Math.sign(diffLevel) < 0) {
                for (let i = 0; i < this.surface.length; i++) {
                    this.surface[i] = max(this.normalLevel, this.surface[i])
                }
            }
            const fadeDist = 5
            if (this.idx > 0 && this.idx < this.parent.surfaces.length - 1) {
                // divide by 2 and add to left&right
                // fade function for change neighbor surface value
                const leftSurface = this.parent.surfaces[this.idx - 1]
                const rightSurface = this.parent.surfaces[this.idx + 1]
                const fadeHeight = easeInCirc(abs(diffArea / 2), fadeDist)
                const diffSign = Math.sign(diffArea)
                if (!fadeHeight) return
                for (let i = 0; i < fadeDist; i++) {
                    leftSurface.surface[leftSurface.surface.length - 1 - i] -= diffSign * fadeHeight[i]
                    //leftSurface.normalLevel -= diffArea/leftSurface.width
                    rightSurface.surface[i] -= diffSign * fadeHeight[i]
                    //rightSurface.normalLevel -= diffArea/rightSurface.width
                    this.surface[i] += diffSign * fadeHeight[i]
                    this.surface[this.surface.length - 1 - i] += diffSign * fadeHeight[i]
                }
            }

            else if (this.idx == this.parent.surfaces.length - 1) {
                // divide by 2 and add to left&right
                // fade function for change neighbor surface value
                const leftSurface = this.parent.surfaces[this.idx - 1]
                const fadeHeight = easeInCirc(abs(diffArea), fadeDist)
                const diffSign = Math.sign(diffArea)
                if (!fadeHeight) return
                for (let i = 0; i < fadeDist; i++) {
                    leftSurface.surface[leftSurface.surface.length - 1 - i] -= diffSign * fadeHeight[i]
                    this.surface[i] += diffSign * fadeHeight[i]
                }
            }
        }
    }
    updatePrev() {
        for (let i = 0; i < this.resol; i++) {
            this.prevSurface[i] = this.surface[i]
        }
    }

    clearValue() {

        for (let i = 0; i < this.resol; i++) {
            this.surface[i] = this.normalLevel
            this.prevSurface[i] = this.normalLevel
            this.velocityField[i] = 0
            this.sourceField[i] = 0
            this.obstacleField[i] = 1
            this.col[i] = false
        }

    }

    IX(i) {
        return this.range[0] + i * (this.range[1] - this.range[0]) * this.invResol
    }

    externalWave(dir, height) {
        if (dir === -1) {
            this.extLeft = height
        }
        else {
            this.extRight = height
        }
    }


}


class ObjCol {
    constructor(obj, idx) {
        this.surface = null
        this.isCol = false
        this.idx = idx
        this.obj = obj
    }
}
class ContSurfaces {
    // Assume it's width equal W
    constructor(normalLevel, resol, objs = []) {
        // Assume that surfaces's order is left to right
        this.surfaces = []
        // TODO : generalize with any shape
        // Assume that objs are box, and not overlap to each other
        this.objsCol = []
        for (let i = 0; i < objs.length; i++) {
            this.objsCol.push(new ObjCol(objs[i], i))
        }
        this.objs = objs
        //this.objConsiderFlags = new Array(objs.length+1).fill(false)
        this.normalLevel = normalLevel
        this.resol = resol
        this.createSubSurface(true)
    }

    calSubResol(a, b) {
        return Math.round(Math.abs(a - b) / W * this.resol)
    }

    isObjCol(obj) {
        const results = {}
        let xLeft = obj.pos.val[0] - obj.w
        let xRight = obj.pos.val[0] + obj.w
        let obsLevel = obj.pos.val[1] + obj.h
        results["isCol"] = ((xLeft >= 0 && xLeft <= W) ||
            (xRight >= 0 && xRight <= W))
            && (obsLevel > this.normalLevel)
        xLeft = Math.max(0, xLeft)
        xRight = Math.min(W, xRight)
        results["xLeft"] = xLeft
        results["xRight"] = xRight
        results["obsLevel"] = obsLevel
        return results
    }

    createSubSurface(first = false) {
        let prevX = 0
        let i = 0
        const newSurfaces = []
        let allResol = []
        if (!first) {
            // asign parent resol from current surfaces

            this.surfaces.forEach(surface => {
                allResol = allResol.concat(surface.surface)
            })
        }
        let parentSurface = new Surface(this, 0, 0, W, first ? this.resol : allResol.length, this.normalLevel)
        if (!first)
            parentSurface.surface = allResol


        //console.log(parentSurface)
        this.objsCol.forEach(objCol => {
            parentSurface = this.splitSurface(parentSurface, objCol, newSurfaces)
            //console.log([...newSurfaces])
        })
        //if (parentSurface.range[1] < W){
        newSurfaces.push(parentSurface)
        //}
        if (newSurfaces.length === 0)
            newSurfaces.push(parentSurface)
        console.log(newSurfaces)
        this.surfaces = newSurfaces

    }

    splitSurface(parent, objCol, newSurfaces) {
        const vars = this.isObjCol(objCol.obj);
        const xLeft = Math.max(parent.range[0], vars.xLeft)
        const xRight = Math.min(parent.range[1], vars.xRight)
        const obsLevel = vars.obsLevel
        const isCol = vars.isCol

        if (!isCol) {
            // This should not happen, since parent is right-most surface
            // which not considered yet
            return parent
        }
        const parentRemovIdx = newSurfaces.length
        // intersect with constSurface
        //console.log(xLeft,parent.range[0])
        if (xLeft > parent.range[0]) {
            // This should happend once for left-most surface
            const prevSurfaceH = parent.surface.slice(0, (xLeft - parent.range[0]) / parent.width * parent.resol)
            const newSurface = new Surface(this, newSurfaces.length, parent.range[0], xLeft, prevSurfaceH.length, this.normalLevel)
            newSurface.surface = prevSurfaceH
            newSurfaces.push(newSurface)
        }
        const newSurface = new Surface(this, newSurfaces.length, xLeft, xRight, this.calSubResol(xLeft, xRight), obsLevel, objCol.obj)
        newSurface.surface = parent.surface.slice((xLeft - parent.range[0]) / parent.width * parent.resol, (xRight - parent.range[0]) / parent.width * parent.resol)
        newSurfaces.push(newSurface)

        objCol.surface = newSurfaces[newSurfaces.length - 1]
        objCol.isCol = true
        //if (xRight === parent.range[1]){
        const leftMostSurface = new Surface(this, newSurfaces.length, xRight, parent.range[1], this.calSubResol(xRight, parent.range[1]), parent.normalLevel)
        leftMostSurface.surface = parent.surface.slice((xRight - parent.range[0]) / parent.width * parent.resol, (parent.range[1] - parent.range[0]) / parent.width * parent.resol)
        newSurfaces.push(leftMostSurface)
        //}


        //newSurfaces.splice(parentRemovIdx,1)
        return newSurfaces.pop()
    }

    mergeSurfaces(surfaces, idx) {
        let allHeight = []
        surfaces.forEach(surface => {
            allHeight = allHeight.concat(surface.surface)
        })
        const newSurface = new Surface(this, idx, surfaces[0].range[0], surfaces[surfaces.length - 1].range[1], allHeight.length, this.normalLevel)
        newSurface.surface = allHeight
        return newSurface
    }


    retainSubSurface() {
        let colSurfaceCount = 0
        let prevColSurfaceCount = 0
        this.surfaces.forEach(surface => {
            if (surface.box) prevColSurfaceCount++;
        })

        for (let i = 0; i < this.objsCol.length; i++) {
            const objCol = this.objsCol[i]
            const results = this.isObjCol(objCol.obj)
            if (results["isCol"]) {
                objCol.isCol = true
                colSurfaceCount++;
            }
            else {
                if (objCol.surface) {
                    objCol.isCol = false
                    objCol.surface.box = null
                    objCol.surface = null
                }
            }
        }

        let stack = []
        let newSurfaces = []
        //console.log(colSurfaceCount , prevColSurfaceCount)
        if (colSurfaceCount < prevColSurfaceCount) {
            for (let i = 0; i < this.surfaces.length; i++) {
                const surface = this.surfaces[i]

                if (!surface.box) {
                    stack.push(surface)

                }
                else if (stack.length > 1) {

                    const newSurface = this.mergeSurfaces(stack, newSurfaces.length)
                    // replace those surfaces with this newSurface
                    newSurfaces.push(newSurface)
                    stack = []
                    newSurfaces.push(surface)
                }
                else if (stack.length === 1) {
                    newSurfaces.push(stack[0])
                    newSurfaces.push(surface)
                    stack = []
                }
                else {
                    newSurfaces.push(surface)
                }

            }
            if (stack.length > 1) {
                newSurfaces.push(this.mergeSurfaces(stack, newSurfaces.length))
                //console.log(newSurfaces[newSurfaces.length-1])
            }
            else if (stack.length === 1)
                newSurfaces = newSurfaces.concat(stack)
            this.surfaces = newSurfaces
        }
        else if (colSurfaceCount > prevColSurfaceCount) {
            this.createSubSurface()
        }



    }

    addSurface(surface) {
        this.surfaces.push(surface)
    }


    isAffect(consider, another, dir) {
        const height = consider.surface[dir === -1 ? 0 : consider.surface.length - 1]

        if (consider.normalLevel < another.normalLevel) {
            // if (sign*height >  sign*another.surface[dir===1?0:another.surface.length-1]){
            if (height > another.normalLevel) {
                return true
            }

            if (consider.normalLevel > another.normalLevel) {
                // if (sign*height >  sign*another.surface[dir===1?0:another.surface.length-1]){
                if (height < another.normalLevel) {
                    return true
                }
            }



        }
        return false

    }

    oneAffectOther(surfaceIdx, dir) {

        if (this.surfaces.length <= 1) return
        const consider = this.surfaces[surfaceIdx]
        // consider.extRight = null
        // consider.extLeft = null
        // if left-rightMost particle is overlap another surface
        if (dir === 1) {
            if (surfaceIdx < this.surfaces.length - 1) {
                const another = this.surfaces[surfaceIdx + 1]
                if (this.isAffect(consider, another, 1) ||
                    this.isAffect(another, consider, -1)) {
                    consider.externalWave(1, another.surface[0])
                    another.externalWave(-1, consider.surface[consider.surface.length - 1])
                }
            }
        }
        else {
            if (surfaceIdx > 0) {
                const another = this.surfaces[surfaceIdx - 1]
                if (this.isAffect(consider, another, -1) ||
                    this.isAffect(another, consider, 1)) {
                    consider.externalWave(-1, another.surface[another.surface.length - 1])
                    another.externalWave(1, consider.surface[0])
                    //console.log(surfaceIdx)
                }
            }
        }
    }

    clearExt() {
        this.surfaces.forEach(surface => {
            surface.extLeft = null
            surface.extRight = null
        })
    }






}