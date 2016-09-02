import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import s from './DotterPanel.css';

import Dotter from './dotter';
import store from '../../core/store';
import { CANVAS_ID } from '../constants/constants';
import { resizeCanvas, zoom } from '../actions/actionCreators';
import PositionLinesLayer from './PositionLinesLayer';

/* Material-UI */
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';


class DotterPanel extends React.Component {
    constructor(props) {
        super(props);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state = this.stateFromStore();
        this._onResize = this._onResize.bind(this);
        this.zoomIn = this.zoomIn.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
    }

    stateFromStore() {
        let storeState = store.getState();
        return {
            alphas: storeState.greyScale.initialAlphas,
            windowSize: storeState.windowSize,
            scoringMatrix: storeState.scoringMatrix,
            canvasSize: storeState.canvasSize,
            zoomLevel: storeState.zoomLevel,
        }
    }

    /* Lifecycle */

    componentWillMount() {
        store.subscribe(() => {
            this.setState( this.stateFromStore() );
        });
    }
    componentDidMount() {
        window.addEventListener('resize', this._onResize);
    }
    componentWillUnmount() {
        window.addEventListener('resize', this._onResize);
    }
    componentDidUpdate(prevProps, prevState) {
        let state = store.getState();
        let d = new Dotter(state.canvasSize, state.windowSize, state.s1, state.s2, state.scoringMatrix);
        let greyScale = state.greyScale;
        let scaledAlphas = d.rescaleAlphas(greyScale.initialAlphas, greyScale.minBound, greyScale.maxBound);
        d.fillCanvas(scaledAlphas);
    }

    /* Events */

    _onResize() {
        let _this = this;
        clearTimeout(window.resizedFinished);
        window.resizedFinished = setTimeout(function() {
            let width = ~~ (0.33 * window.innerWidth);
            store.dispatch(resizeCanvas(width));
        }, 250);
    }

    /* Calculate the zoom level here because it could be a slider or anything */
    zoomIn() {
        store.dispatch(zoom( 2 * this.state.zoomLevel , "in"));
    }
    zoomOut() {
        let currentZoom = this.state.zoomLevel;
        if (currentZoom > 1) {
            store.dispatch(zoom( currentZoom / 2 , "out"));
        }
    }


    render() {
        let canvasSize = this.state.canvasSize;
        let zoomLevel = this.state.zoomLevel;
        // Set style here because Material-UI doesn't give a shit about my class name.
        let verticalButtonStyle = {margin: "5px 1px 5px 5px", padding: "0", height: "24px", width: "24px"};

        return (
            <div className={s.root}>
                <div className={s.legendX}>{"Sequence 1"}</div>
                <div>
                    <div className={s.legendY}>{"Sequence 2"}</div>
                    <div style={{position: 'relative', minHeight: canvasSize, minWidth: canvasSize}}>

                        {/* Bottom layer: the dot plot */}

                        <canvas id={CANVAS_ID}
                                className={s.canvas}
                                width={canvasSize}
                                height={canvasSize}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    zIndex: 0,
                                }}
                        ></canvas>

                        {/* Top layer: the lines indicating the current position */}

                        <PositionLinesLayer canvasSize={canvasSize} zoomLevel={zoomLevel} />

                        {/* Zoom buttons */}

                        <div className={s.verticalToolbar} >
                            <IconButton className={s.verticalButton} style={verticalButtonStyle} onClick={this.zoomIn} >
                                <FontIcon className="material-icons">zoom_in</FontIcon>
                            </IconButton>
                            <IconButton className={s.verticalButton} style={verticalButtonStyle} onClick={this.zoomOut} >
                                <FontIcon className="material-icons">zoom_out</FontIcon>
                            </IconButton>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}



export default DotterPanel;
