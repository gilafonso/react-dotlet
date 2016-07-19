import React from 'react';
import s from './TwoSeqsPanel.css';
import store from '../../core/store';
import * as helpers from '../helpers';


class TwoSeqsPanel extends React.Component {

    state = this.stateFromStore();

    stateFromStore() {
        let storeState = store.getState();
        return {
            s1: storeState.input.s1,
            s2: storeState.input.s2,
            window_size: storeState.input.window_size,
            i: storeState.dotter.i,
            j: storeState.dotter.j,
        }
    }

    componentWillMount() {
        store.subscribe(() => {
            this.setState( this.stateFromStore() );
        });
    }

    /*
     * Make it prettier: Mark start or end of the sequence.
     * @param w: subsequence to decorate
     * @param i: index of the subsequence center
     * @param size: half the total number of chars
     */
    formatSeq(w, i, size, fill='_') {
        // Mark start of the sequence
        if (i < size) {
            w = fill.repeat(size-i) + w;
        // Mark end of the sequence
        }
        w += fill.repeat(2*size - w.length + 1)
        return w;
    }

    render() {
        let i = this.state.i,
            j = this.state.j,
            s1 = this.state.s1,
            s2 = this.state.s2,
            window_size = this.state.window_size;
        let ws = Math.floor(window_size / 2);
        let nchars = 36; // on each side of `i`
        let w1 = helpers.getSequenceAround(s1, i, nchars);
        let w2 = helpers.getSequenceAround(s2, j, nchars);
        let L = Math.max(s1.length, s2.length);

        /* Formatting */
        let nbsp = String.fromCharCode(160); // code for &nbsp;
        let fill = nbsp;
        w1 = this.formatSeq(w1, i, nchars, fill);
        w2 = this.formatSeq(w2, j, nchars, fill);
        let ruler = this.formatSeq("|", 0, nchars, nbsp);  // "|"
        let caret = this.formatSeq("^", 0, nchars, nbsp);  // "^"
        let seqinfo1 = this.formatSeq("Seq1:"+i, 4, nchars, nbsp);
        let seqinfo2 = this.formatSeq("Seq2:"+j, 4, nchars, nbsp);

        /* Return "s.same" style if the characters match on both substrings */
        function sameCharStyle(k) {
            if (w1[k] === w2[k] && w1[k] !== fill) {
                return s.same;
            } else {
                return  '';
            }
        }

        /* Draw the border showing the running window */
        function borderCharStyle(nseq, k) {
            if (k === nchars - window_size + ws + 1) {
                if (k === nchars + ws) {
                    if (nseq === 1) return s.windowTopRight +' '+ s.windowTopLeft;
                    else return s.windowBotRight +' '+ s.windowBotLeft;
                }
                if (nseq === 1) return s.windowTopLeft;
                else return s.windowBotLeft;
            }
            if (k === nchars + ws) {
                if (nseq === 1) return s.windowTopRight;
                else return s.windowBotRight;
            }
        }

        let spans1 = w1.split('').map((c,i) =>
            <span key={i} className={[
                s.seq1,
                sameCharStyle(i),
                borderCharStyle(1, i),
            ].join(' ')} >{c}</span> );

        let spans2 = w2.split('').map((c,i) =>
            <span key={i} className={[
                s.seq2,
                sameCharStyle(i),
                borderCharStyle(2, i),
            ].join(' ')} >{c}</span> );

        return (
            <div id="two-seqs-panel" className={s.twoSeqsPanel}>
                <div className={s.sequence}>{seqinfo1}</div>
                <div className={s.sequence}>{ruler}</div>
                <div className={s.sequence}>{spans1}</div>
                <div className={s.sequence}>{spans2}</div>
                <div className={s.sequence}>{caret}</div>
                <div className={s.sequence}>{ruler}</div>
                <div className={s.sequence}>{seqinfo2}</div>
                {"window_size: " + window_size}
            </div>
        );
    }
}


export default TwoSeqsPanel;
