import { DNA, PROTEIN } from '../constants/constants';
import geneticCode from '../constants/geneticCode';

/*
 * Guess if a sequence is a protein or DNA.
 * @param nchars: number of chars to test before concluding.
 */
function guessSequenceType(seq, nchars=200) {
    let L = seq.length;
    // The longest known protein, Titin, has up to 33K aminoacids.
    if (L === 0 || L > 40000) {
        return DNA;
    }
    // Check the first N characters. If they are all ATGCU, conclude it is DNA.
    // Check up to the size of a long protein (~1000).
    // The original code went through the whole sequence and said it is DNA if more than 80% is ATGCU.
    let nucleotides = new Set(['A','T','G','C','U']);
    let N = Math.min(nchars, L);
    for (let i=0; i<N; i++) {
        if (! (nucleotides.has(seq[i]))) {
            return PROTEIN;
        }
    }
    return DNA;
}


/*
 * Translate an RNA sequence to protein.
 */
function translate(seq, phase=0) {
    let L = seq.length;
    let protein = [];
    phase = phase % 3;
    if ((L-phase) % 3 !== 0) {
        throw new Error("Cannot translate an RNA sequence whose length is not a multiple of 3.");
    }
    for (let i=phase; i<=L-3; i+=3) {
        let aa = geneticCode[seq.slice(i, i+3)];
        if (aa === undefined) {
            throw new Error("Undefined aminoacid for codon '"+seq.slice(i, i+3)+"'.");
        }
        protein.push(aa);
    }
    return protein;
}


export {
    guessSequenceType,
    translate,
}
