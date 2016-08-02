import { CHANGE_SEQUENCE, CHANGE_WINDOW_SIZE, CHANGE_SCORING_MATRIX,
         INSPECT_COORDINATE, KEYBOARD_DIRECTION, SLIDE_TWO_SEQS } from './actionTypes';
import { fillCanvas, drawPositionLines } from '../DotterPanel/dotter';
import { guessSequenceType, commonSeqType } from '../InputPanel/input';
import { PROTEIN, DNA } from '../constants/constants';
import { translateProtein } from '../helpers';
import defaultState from './defaultState';


let reducer = (state = defaultState, action) => {
    let newState;
    switch (action.type) {

    /*
     * When the sequence changes, draw to the canvas as a side-effect, but actually compute
     * scores and store the latter. Also compute the max seq length, as many methods require it.
     */
    case CHANGE_SEQUENCE:
        newState = Object.assign({}, state);
        let s1, s2;
        let scores, seqtype;
        let seq = action.sequence.toUpperCase();
        let guessedType = guessSequenceType(seq, 200);
        if (action.seqn === 1) {
            scores = fillCanvas(seq, state.s2, state.windowSize, state.scoringMatrix);
            seqtype = commonSeqType(guessedType, state.s2Type);
            newState.s1 = seq;
            newState.s1Type = action.seqtype;
        } else {
            scores = fillCanvas(state.s1, seq, state.windowSize, state.scoringMatrix);
            seqtype = commonSeqType(state.s1Type, guessedType);
            newState.s2 = seq;
            newState.s2Type = action.seqtype;
        }
        let ls1 = newState.s1.length;
        let ls2 = newState.s2.length;
        newState.scores = scores;
        newState.matrixSize = Math.max(ls1, ls2);
        newState.i = 0; newState.j = 0;
        drawPositionLines(state.i, state.j, ls1, ls2, newState.matrixSize);
        return newState;

    /*
     * When the user changes the size of the sliding window.
     */
    case CHANGE_WINDOW_SIZE:
        let winsize = action.windowSize;
        if (! winsize) {
            winsize = 1;
        }
        scores = fillCanvas(state.s1, state.s2, winsize, state.scoringMatrix);
        return Object.assign({}, state, {scores: scores, windowSize: parseInt(winsize)});

    /*
     * When the user changes the scoring matrix.
     */
    case CHANGE_SCORING_MATRIX:
        scores = fillCanvas(state.s1, state.s2, state.windowSize, action.scoringMatrix);
        return Object.assign({}, state, {scores: scores, scoringMatrix: action.scoringMatrix});

    /*
     * On click on the canvas.
     */
    case INSPECT_COORDINATE:
        drawPositionLines(action.i, action.j, state.s1.length, state.s2.length, state.matrixSize);
        return Object.assign({}, state, {i: action.i, j: action.j});

    /*
     * When keyboard direction arrows are pressed.
     * Expects `action.[right|left|top|down]`
     */
    case KEYBOARD_DIRECTION:
        let keybDirection;
        if (action.direction === 'down' && state.j < state.s2.length-1) {
            keybDirection = {j: state.j + 1};
        } else if (action.direction === 'up' && state.j > 0) {
            keybDirection = {j: state.j - 1};
        } else if (action.direction === 'right' && state.i < state.s1.length-1) {
            keybDirection = {i: state.i + 1};
        } else if (action.direction === 'left' && state.i > 0) {
            keybDirection = {i: state.i - 1};
        }
        newState = Object.assign({}, state, keybDirection);
        drawPositionLines(newState.i, newState.j, state.s1.length, state.s2.length, state.matrixSize);
        return newState;

    /*
     * When keyboard direction arrows are pressed.
     * Expects `action.seqn` in [1|2]: the sequence number,
     * and `action.shift`: the positive or negative shift.
     */
    case SLIDE_TWO_SEQS:
        let slideDirection;
        if (action.seqn === 1) {
            slideDirection = {i: state.i + action.shift};
        } else {
            slideDirection = {j: state.j + action.shift};
        }
        newState = Object.assign({}, state, slideDirection);
        drawPositionLines(newState.i, newState.j, state.s1.length, state.s2.length, state.matrixSize);
        return newState;

    default:
        return state;
}};


export default reducer;
