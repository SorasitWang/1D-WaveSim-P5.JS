const W = 800, H = 600
const SURFACE_RESOL = 60
const damping = 0.985
const segmentSize = W / SURFACE_RESOL;
const segmentSize2 = segmentSize * segmentSize
const EPSILON = 1e-6
const G = 10
const waterDense = 0.0001