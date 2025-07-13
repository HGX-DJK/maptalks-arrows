import * as maptalks from 'maptalks';
import Point from 'point-geometry';
import { getArrowBody, paintSmoothLine } from '../PlotUtils';

export default class StraightArrow extends maptalks.Curve {

    static fromJSON(json) {
        const feature = json['feature'];
        const arrow = new StraightArrow(feature['geometry']['coordinates'], json['options']);
        arrow.setProperties(feature['properties']);
        return arrow;
    }

    _toJSON(options) {
        return {
            'feature': this.toGeoJSON(options),
            'subType': 'StraightArrow'
        };
    }

    startEdit(options = {}) {
        options.newVertexHandleSymbol = {
            'markerType': 'ellipse',
            'markerFill': '#fff',
            'markerLineColor': '#000',
            'markerLineWidth': 2,
            'markerWidth': 10,
            'markerHeight': 10,
            'opacity': 0
        };
        return super.startEdit(options);
    }

    setArrowConfig(config) {
        if (!this.options.arrowConfig) {
            this.options.arrowConfig = {};
        }
        this.options.arrowConfig = Object.assign({}, this.options.arrowConfig, config);
        this._clearCache();
        this.setCoordinates(this.getCoordinates());  // 触发重新渲染
    }

    _getPaintParams() {
        const map = this.getMap();
        const zoomScale = map.getGLScale();
        const points = this._getPath2DPoints(this._getPrjCoordinates());
        if (points.length <= 1) {
            return null;
        }
        const length = this._get2DLength();
        const lineWidth = length * this.options['widthRatio'];

        const arrowPairs = getArrowBody(points, lineWidth, map);
        const h1 = arrowPairs[0][arrowPairs[0].length - 1];
        const h2 = arrowPairs[1][arrowPairs[1].length - 1];

        const arrowConfig = this.options.arrowConfig || {};
        const lineRatio = typeof arrowConfig.lineRatio !== 'undefined' ? arrowConfig.lineRatio : 1;
        const f1 = typeof arrowConfig.f1 !== 'undefined' ? arrowConfig.f1 : 0.8;
        const f2 = typeof arrowConfig.f2 !== 'undefined' ? arrowConfig.f2 : 1.4;
        const hScale1 = typeof arrowConfig.hScale1 !== 'undefined' ? arrowConfig.hScale1 : 2.2;
        const hScale2 = typeof arrowConfig.hScale2 !== 'undefined' ? arrowConfig.hScale2 : 0.7;
        const h1h2Ratio = typeof arrowConfig.h1h2Ratio !== 'undefined' ? arrowConfig.h1h2Ratio : 2.3;

        const arrowHead = this._getArrowHead(h1, h2, points, lineWidth,
            lineRatio, f1, f2, hScale1, hScale2, h1h2Ratio);

        let plots = [];
        plots.push.apply(plots, arrowPairs[0]);
        plots.push.apply(plots, arrowHead);
        for (let i = arrowPairs[1].length - 1; i >= 0; i--) {
            plots.push(arrowPairs[1][i]);
        }

        plots = plots.map(p => p.multi(zoomScale));
        return [plots, [arrowPairs[0].length, arrowHead.length, arrowPairs[1].length]];
    }

    _paintOn(ctx, points, segs, lineOpacity, fillOpacity, lineDasharray) {
        ctx.beginPath();
        let seg;
        let i = 0;

        ctx.moveTo(points[0].x, points[0].y);
        seg = points.slice(0, segs[0]);
        paintSmoothLine(ctx, seg, lineOpacity, 0.7, true);

        i += segs[0];
        maptalks.Canvas._path(ctx, points.slice(i, i + segs[1]), lineDasharray, lineOpacity);

        i += segs[1];
        seg = points.slice(i, i + segs[2]);
        paintSmoothLine(ctx, seg, lineOpacity, 0.7, true);

        this._closeArrow(ctx, points[points.length - 1], points[0]);
        maptalks.Canvas._stroke(ctx, lineOpacity);
        maptalks.Canvas.fillCanvas(ctx, fillOpacity, points[0].x, points[0].y);
    }

    _closeArrow(ctx) {
        ctx.closePath();
    }

    _getArrowHead(h1, h2, points, lineWidth, lineRatio, f1, f2, hScale1, hScale2, h1h2Ratio) {
        const arrowHead = this._getArrowHeadPoint(h1, h2, points[points.length - 1], lineWidth * lineRatio, f1, hScale1);
        const vertex01 = new maptalks.Point((arrowHead[0].x + arrowHead[1].x) / 2, (arrowHead[0].y + arrowHead[1].y) / 2);
        const head0 = this._getArrowHeadPoint(arrowHead[0], arrowHead[1], vertex01, lineWidth * lineRatio, f2, hScale2)[0];
        const vertex21 = new maptalks.Point((arrowHead[2].x + arrowHead[1].x) / 2, (arrowHead[2].y + arrowHead[1].y) / 2);
        const head2 = this._getArrowHeadPoint(arrowHead[2], arrowHead[1], vertex21, lineWidth * lineRatio, f2, hScale2)[0];

        if (points.length === 2) {
            return [h1, head0, arrowHead[1], head2, h2];
        } else {
            const besierPoints = paintSmoothLine(null, points, null, 0.8, false);
            const controlPoint = new maptalks.Point(besierPoints[besierPoints.length - 1].prevCtrlPoint);
            const lastPoint = points[points.length - 1];
            const sub = lastPoint.sub(controlPoint);
            if (sub.x === 0 && sub.y === 0) {
                return [h1, head0, arrowHead[1], head2, h2];
            }
            const h1h2Length = h1.distanceTo(h2);
            const direction = sub.unit();
            const headPoint = new maptalks.Point(
                lastPoint.x + direction.x * h1h2Length * h1h2Ratio,
                lastPoint.y + direction.y * h1h2Length * h1h2Ratio
            );
            return [h1, head0, headPoint, head2, h2];
        }
    }

    _getArrowHeadPoint(h1, h2, vertex, lineWidth, f, hScale) {
        if (!hScale) hScale = 1;
        h1 = new Point(h1.x, h1.y);
        h2 = new Point(h2.x, h2.y);
        const normal = h1.sub(h2)._unit();
        const head0 = vertex.add(lineWidth * normal.x * f, lineWidth * normal.y * f);
        const head2 = vertex.add(lineWidth * -normal.x * f, lineWidth * -normal.y * f);
        normal._perp()._mult(-1);
        const head1 = vertex.add(hScale * lineWidth * normal.x, hScale * lineWidth * normal.y);
        return [head0, head1, head2];
    }
}

StraightArrow.mergeOptions({
    'widthRatio': 0.10,
    'arrowStyle': [],
    'tailWidthFactor': 0.1,
    'headWidthFactor': 1,
    'neckWidthFactor': 0.2,
    'headAngle': Math.PI / 8.5,
    'neckAngle': Math.PI / 13
});

StraightArrow.registerJSONType('StraightArrow');

maptalks.DrawTool.registerMode('StraightArrow', {
    action: ['click', 'mousemove', 'dblclick'],
    create(projection, prjPath) {
        const path = prjPath.map(c => projection.unproject(c));
        const line = new StraightArrow(path);
        line._setPrjCoordinates(prjPath);
        return line;
    },
    update(projection, prjPath, geometry) {
        const prjCoords = Array.isArray(prjPath) ? prjPath : geometry._getPrjCoordinates().concat(prjPath);
        const path = prjCoords.map(c => projection.unproject(c));
        geometry.setCoordinates(path);
        geometry._setPrjCoordinates(prjCoords);
    },
    generate(geometry) {
        return geometry;
    }
});
