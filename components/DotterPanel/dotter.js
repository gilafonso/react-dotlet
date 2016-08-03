
import { CANVAS_SIZE, CANVAS_ID } from '../constants/constants';
import * as helpers from '../common/helpers';
import { SCORING_MATRIX_NAMES } from '../constants/constants';
import { SCORING_MATRICES, MIN_MAX } from '../constants/scoring_matrices/scoring_matrices';
import { calculateMatches, calculateScore } from '../common/scoring';

/**
 * Plotting functions in the main canvas.
 */


/**
 * Caclulate the size in px of a "point" on the canvas
 * (bigger if the sequence is shorter than the canvas' dimensions in px,
 * to fill it completely).
 * @param round: whether to allow float sizes (with performance overhead).
 */
function getCanvasPt(canvasSize, lenSeq, round=true) {
    var canvasPt;
    if (lenSeq < canvasSize) {
        canvasPt = canvasSize / lenSeq;
        if (round) { canvasPt = Math.floor(canvasPt); }
    } else {
        canvasPt = 1;
    }
    return canvasPt;
}

/**
 * Calculate the number of points in the canvas given its size in px and the desired point size.
 * @param canvasSize: canvas size, in pixels.
 * @param canvasPt: size of a 'point', in pixels.
 */
function getNpoints(canvasSize, canvasPt) {
    return Math.floor(canvasSize / canvasPt)
}

/**
 * Calculate the number of sequence characters represented by one point in the canvas.
 * @param round: whether to allow float sizes (with performance overhead).
 */
function getStep(npoints, lenSeq, round=true) {
    if (npoints > lenSeq + lenSeq % npoints) {
        throw new RangeError("There cannot be more canvas points than sequence elements. " +
                             "Increase points size instead.");
    }
    let step = lenSeq / npoints;
    if (round) { step = Math.ceil(step); }
    return step;
}

/**
 * Get the position (in px) on the canvas representing the given index in the sequence.
 * @param L (int): matrix size (max sequence length).
 */
function coordinateFromSeqIndex(index, L, canvasSize=CANVAS_SIZE, round=true) {
    let px = index * (canvasSize / L);
    if (round) px = Math.round(px);
    return px;
}

/**
 * Return *approximately* the index on the sequence `seq` corresponding to pixel coordinate `px`.
 * The problem is that if the sequence length is not a multiple of the canvas size,
 * there is an empty margin that must not count. So round it up to a multiple,
 * then cut down if necessary.
 *
 * @param px (float): position clicked on the canvas (in pixels, != `npoints`!).
 * @param L (int): matrix size (max sequence length).
 */
function seqIndexFromCoordinate(px, L, canvasSize=CANVAS_SIZE) {
    let round = L > 2 * canvasSize;
    let canvasPt = getCanvasPt(canvasSize, L, round);
    let npoints = Math.floor(canvasSize / canvasPt);
    let step = getStep(npoints, L, round);
    return Math.ceil((px / canvasPt) * step) - 1;
}

function initBlankCanvas(canvasId) {
    let cv = document.getElementById(canvasId);
    if (cv === null) { throw new ReferenceError("Canvas not found"); }
    let ctx = cv.getContext('2d');
    let canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return ctx;
}

/**
 * Fill the dotter canvas with similarity scores; return the scores density.
 */
function fillCanvas(s1, s2, windowSize, scoringMatrixName) {
    let ctx = initBlankCanvas(CANVAS_ID);
    let canvasSize = ctx.canvas.width;

    let ws = Math.floor(windowSize / 2);   // # of nucleotides on each side
    let scores = {};

    let ls1 = s1.length;
    let ls2 = s2.length;
    let L = Math.max(ls1, ls2);
    let round = L > 2 * canvasSize;                    // For small sequences, use float pixel coordinates at the expense of performance
    let canvasPt = getCanvasPt(canvasSize, L, round);  // Size of a "dot" on the canvas, when L is small (else 1)
    let npoints = getNpoints(canvasSize, canvasPt);    // Number of points in one line when L is small (else CANVAS_SIZE)
    let step = getStep(npoints, L, round);             // 1 point -> `step` characters

    let scoringFunction;
    if (scoringMatrixName === SCORING_MATRIX_NAMES.IDENTITY) {
        scoringFunction = calculateMatches;
    } else {
        scoringFunction = calculateScore;
    }
    let matrix = SCORING_MATRICES[scoringMatrixName];
    let minMax = MIN_MAX[scoringMatrixName];
    let minScore = minMax[0] * windowSize;
    let maxScore = minMax[1] * windowSize;
    let scoresRange = maxScore - minScore;

    for (let i=0; i <= npoints; i++) {
        let q1 = Math.round(i * step);                            // position on seq1. First is 0, last is L
        if (q1 >= ls1) break;
        let subseq1 = helpers.getSequenceAround(s1, q1, ws);      // nucleotides window on seq1

        for (let j=0; j <= npoints; j++) {
            let q2 = Math.round(j * step);                        // position on seq2
            if (q2 >= ls2) break;
            let subseq2 = helpers.getSequenceAround(s2, q2, ws);  // nucleotides window on seq2
            let score = scoringFunction(subseq1, subseq2, matrix);  // always an int
            if (! (score in scores)) {
                scores[score] = 0;
            } else {
                scores[score] += 1;
            }
            ctx.globalAlpha = (score - minScore) / scoresRange;
            ctx.fillRect(q1 * canvasPt, q2 * canvasPt, canvasPt, canvasPt);
        }
    }
    return scores;
}

/**
 * Draw the vertical and horizontal lines showing the current position on the canvas.
 */
function drawPositionLines(i, j, ls1, ls2, L, canvasSize=CANVAS_SIZE) {
    let ctx = initBlankCanvas(CANVAS_ID +'-topLayer');
    let x = coordinateFromSeqIndex(i, L, canvasSize, false);
    let y = coordinateFromSeqIndex(j, L, canvasSize, false);
    // If the point size is > 1, make the lines pass in the middle.
    if (L < canvasSize) {
        let canvasPt = getCanvasPt(canvasSize, L, false);
        x += canvasPt/2;
        y += canvasPt/2;
    }
    ctx.fillStyle = "red";
    ctx.fillRect(x, 1, 1, (ls2/L) * canvasSize);
    ctx.fillRect(1, y, (ls1/L) * canvasSize, 1);
}


export {
    getCanvasPt,
    getStep,
    coordinateFromSeqIndex,
    seqIndexFromCoordinate,
    fillCanvas,
    drawPositionLines,
};
