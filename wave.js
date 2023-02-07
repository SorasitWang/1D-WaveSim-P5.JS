function updateSurface(surface) {

    for (let i = 1; i < SURFACE_RESOL - 1; i++) {
        surface[i] += sourceField[i];
        surface[i] *= obstacleField[i];

    }

    //propagate
    for (let i = 1; i < SURFACE_RESOL - 1; i++) {
        velocityField[i] += (surface[(i - 1)] + surface[(i + 1)]) / 2.0 - surface[i];
        velocityField[i] *= damping;
    }

    //update vertex heights
    for (let i = 1; i < SURFACE_RESOL - 1; i++) {
        surface[i] += velocityField[i];
    }
}

function updateSurface1(surface, dt, offset = 1) {
    // a bit hard code

    dt /= 9
    const c = 1, c2 = c * c
    const segmentSize = abs(surface.range[1] - surface.range[0]) / surface.resol;
    const segmentSize2 = pow(segmentSize, 2)
    for (let i = offset; i < surface.resol - offset; i++) {
        surface.surface[i] += surface.sourceField[i];
        surface.surface[i] *= surface.obstacleField[i];
    }
    //propagate
    //const obsLevel = boxObj.pos.valss[1] + boxObj.h
    for (let i = offset; i < surface.resol - offset; i++) {

        //const itSelf = (col[i]?obsLevel:surface[i])
        const itSelf = surface.surface[i]
        let lhs = surface.surface[i - 1]
        if (i === 0)
            lhs = surface.extLeft ? surface.extLeft : itSelf

        let rhs = surface.surface[i + 1]
        if (i === surface.resol - 1)
            rhs = surface.extRight ? surface.extRight : itSelf


        f = c2 * (lhs + rhs - 2 * itSelf) / segmentSize2 + calExtForce(i)
        surface.velocityField[i] += f * dt;

        if (offset === 0) {
            for (let idx = 0; idx < surface.resol; idx++) {
                const heigth = surface.surface[idx]
                const dir = heigth > surface.normalLevel ? -1 : 1
                surface.velocityField[idx] += dir * abs(heigth - surface.normalLevel) * 2e-7 * dt
            }
        }


        surface.velocityField[i] *= damping;
    }


    //update vertex heights
    for (let i = offset; i < surface.resol - offset; i++) {

        surface.surface[i] += surface.velocityField[i] * dt;
        if (surface.box)
            surface.surface[i] = max(surface.surface[i],
                surface.box.pos.val[1] + surface.box.h)
    }


}

function calExtForce(i) {
    return 0;
    if (col[i]) {
        //console.log((surface[i]-prevSurface[i]) * waterDense * G)
        // console.log(surface[i],prevSurface[i])
        // return  (surface[i]-prevSurface[i])
        return -(surface[i] - prevSurface[i]) * waterDense * G
    }
    return 0
}
