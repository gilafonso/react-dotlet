import React from 'react';
import s from './DotterPanel.css';
import * as dotter from './dotter';
import store from '../../core/store';
import { CANVAS_SIZE } from './constants/constants';
import { inspectCoordinate } from './actions/actionCreators';


class DotterPanel extends React.Component {
    static propTypes = {
        window_size: React.PropTypes.number,
    };

    componentDidMount() {
        let state = store.getState().input;
        dotter.fillCanvas(state.s1, state.s2, this.props.window_size);
    }

    componentDidUpdate() {
        let state = store.getState().input;
        dotter.fillCanvas(state.s1, state.s2, this.props.window_size);
    }

    _onClick(e) {
        let cv = e.target;
        let elemLeft = cv.offsetLeft,
            elemTop = cv.offsetTop,
            context = cv.getContext('2d');
        let x = e.pageX - elemLeft,
            y = e.pageY - elemTop;
        console.debug(x, y)
        store.dispatch(inspectCoordinate);
    }

    render() {
        return (
            <div className={s.canvasContainer}>
                <canvas id='dotter-canvas'
                        ref={(c) => this._refDotterCanvas = c}
                        className={s.canvas}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        onClick={this._onClick}
                ></canvas>
            </div>
        );
    }
}



export default DotterPanel;
