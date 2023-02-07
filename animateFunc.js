
function easeInCirc(totalArea, width) {
    /*
      Input
        totalArea (number): area under curve
        width (number): width of curve
      Output
        yList : heigth result
    */
    if (totalArea <= EPSILON) return false
    const r = Math.sqrt(totalArea / (1 - Math.PI / 4))
    //console.log(r)
    const r2 = r * r
    const coefX = r / width
    const yList = []
    let rawArea = 0
    for (let x = 0; x < width; x++) {
        if (x >= width)
            yList.push(0)
        else {
            let heightTmp = -Math.sqrt(r2 - Math.pow(coefX * x - r, 2)) + r
            //console.log(totalArea , Math.PI)
            rawArea += heightTmp
            yList.push(heightTmp)
        }
    }

    const ratio = totalArea / rawArea
    //console.log(totalArea,rawArea)
    for (let i = 0; i < yList.length; i++) {
        yList[i] *= ratio
    }
    return yList

}
const re = easeInCirc(0, 5)
console.log(re)