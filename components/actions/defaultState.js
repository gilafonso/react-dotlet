import { SCORING_MATRIX_NAMES, DNA, PROTEIN } from '../constants/constants';


const smallExample = {
    s1: "ATGC",
    s2: "ATTAGGCGAGG",
    s1Type: DNA,
    s2Type: DNA,
    scoringMatrix: SCORING_MATRIX_NAMES.BLOSUM80,
};

const smallestExample = {
    s1: "APEERLLAPLLL",
    s2: "AGGCGAGG",
    s1Type: DNA,
    s2Type: DNA,
    scoringMatrix: SCORING_MATRIX_NAMES.BLOSUM80,
    windowSize: 1,
};

// s1: YWHAB from Uniprot, len 246
// s2: YWHAZ Coelacant ortholog
const orthologExample = {
    s1: "MTMDKSELVQKAKLAEQAERYDDMAAAMKAVTEQGHELSNEERNLLSVAYKNVVGARRSSWRVISSIEQKTERNEKKQQMGKEYREKIEAELQDICNDVLELLDKYLIPNATQPESKVFYLKMKGDYFRYLSEVASGDNKQTTVSNSQQAYQEAFEISKKEMQPTHPIRLGLALNFSVFYYEILNSPEKACSLAKTAFDEAIAELDTLNEESYKDSTLIMQLLRDNLTLWTSENQGDEGDAGEGEN",
    s2: "RKPLQTPTPIRRLWTMDTSELVQKAKLAEQAERYDDMAASMKAVTEQGAELSNEERNLLSVAYKNVVGARRSSWRVISSIEQKTEGSEQKQQMAREYREKIEAELRDICNDVLGLLDKYLIANASKAESKVFYLKMKGDYYRYLAEVAAGEDKKSTVDHSQQVYQEAFEISKKEMTSTHPIRLGLALNFSVFYYEILNLPEQACGLAKTAFDDAISELDKLGDESYKDSTLIMQLLRDNLTVST",
    s1Type: PROTEIN,
    s2Type: PROTEIN,
    scoringMatrix: SCORING_MATRIX_NAMES.BLOSUM80,
};


let defaultState = {
    s1: '',
    s2: '',
    s1Type: PROTEIN,
    s2Type: PROTEIN,
    density: [],
    windowSize: 5,
    scoringMatrix: SCORING_MATRIX_NAMES.IDENTITY,
    i: 0,
    j: 0,
    dotter: {
    },
    greyScale: {
        minBound: 0,
        maxBound: 255,
        initialAlphas: new Uint8ClampedArray([0]),
    },
    canvasSize: ~~ (0.33 * window.innerWidth),
};

Object.assign(defaultState, orthologExample);


export default defaultState;
