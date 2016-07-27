import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import s from './DotterPanel.css';
import * as dotter from './dotter';
import store from '../../core/store';
import { CANVAS_SIZE, CANVAS_ID } from '../constants/constants';
import { inspectCoordinate, keyboardArrowShiftCoordinate } from '../actions/actionCreators';


class DotterPanel extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state = {
            mouseDown: false,
        }
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onClick = this._onClick.bind(this);
    }

    /* Lifecycle */

    componentDidMount() {
        window.addEventListener('keydown', this._onKeyDown, true)
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this._onKeyDown, true)
    }

    componentDidUpdate() {
        let state = store.getState();
        dotter.fillCanvas(state.s1, state.s2, state.windowSize, state.scoringMatrix);
    }

    /* Events */

    _onKeyDown(e) {
        var keyCode = e.keyCode;
        var direction;
        switch (e.keyCode) {
            case 37: direction = 'left'; break;
            case 38: direction = 'up'; break;
            case 39: direction = 'right'; break;
            case 40: direction = 'down'; break;
            default: return;
        }
        store.dispatch(keyboardArrowShiftCoordinate(direction));
    }

    _onClick(e) {
        this.inspect(e);
    }

    _onMouseDown() { this.setState({mouseDown: true}); }
    _onMouseUp() { this.setState({mouseDown: false}); }
    _onMouseMove(e) {
        if (this.state.mouseDown) {
            this.inspect(e);
        }
    }

    /*
     * Get the mouse coordinates relative to the canvas position,
     * deduce the approximate corresponding sequence characters indices `i` and `j`,
     * and fire an action.
     */
    inspect(event) {
        // Get convas coordinates
        let canvas = event.target;
        let dims = canvas.getBoundingClientRect();
        let x = event.pageX - dims.left,
            y = event.pageY - dims.top;
        // Fetch store state to get the seq lengths
        let state = store.getState();
        let ls1 = state.s1.length,
            ls2 = state.s2.length;
        let L = Math.max(ls1, ls2);
        // Return corresponding char indices
        let i = dotter.seqIndexFromCoordinate(x, L);
        let j = dotter.seqIndexFromCoordinate(y, L);
        // Make sure we don't get out of bounds while dragging
        i = Math.min(Math.max(0, i), ls1-1);
        j = Math.min(Math.max(0, j), ls2-1);
        // Dispatch
        store.dispatch(inspectCoordinate(Math.min(i,ls1), Math.min(j,ls2)));
    }

    render() {
        return (
            <div className={s.root} style={{position: 'relative', minHeight: CANVAS_SIZE, minWidth: CANVAS_SIZE}}>

                {/* Bottom layer: the dot plot */}

                <canvas id={CANVAS_ID}
                        className={s.canvas}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            zIndex: 0,
                        }}
                ></canvas>

                {/* Top layer: the lines indicating the current position */}

                <canvas id={CANVAS_ID +'-topLayer'}
                        className={this.state.mouseDown ? s.mouseDown : ''}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            zIndex: 1,
                        }}
                        onMouseDown={this._onMouseDown}
                        onMouseUp={this._onMouseUp}
                        onMouseMove={this._onMouseMove}
                        onClick={this._onClick}
                >
                </canvas>
            </div>
        );
    }
}



export default DotterPanel;
