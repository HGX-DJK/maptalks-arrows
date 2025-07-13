# maptalks.plotsymbol

A maptalks plugin to support plot symbols, e.g.  DoubleArrow, ClosedCurve, Sector, DiagonalArrow, StraightArrow, etc.

![screenshot](https://user-images.githubusercontent.com/5208386/58606045-90747000-82cc-11e9-9f28-73f9be783342.png)

所有支持的几何形状列表如下：

* DoubleArrow
* ClosedCurve
* Sector
* StraightArrow
* DiagonalArrow
* DoveTailDiagonalArrow

## Examples

* A demo of [maptlaks.plotsymbol](https://fuzhenn.github.io/maptalks.plotsymbol/demo/).
* A demo of [AnimateShow](https://fuzhenn.github.io/maptalks.plotsymbol/demo/animateShow.html).

## Install
  
* Install with npm: ```npm install maptalks.plotsymbol```. 
* Download from [dist directory](https://github.com/maptalks/maptalks.plotsymbol/tree/gh-pages/dist).
* Use unpkg CDN: ```https://unpkg.com/maptalks.plotsymbol/dist/maptalks.plotsymbol.min.js```

## Usage

As a plugin, ```maptalks.plotsymbol``` must be loaded after ```maptalks.js``` in browsers.

### Vanilla Javascript

```html
<script type="text/javascript" src="https://unpkg.com/maptalks/dist/maptalks.min.js"></script>
<script type="text/javascript" src="https://unpkg.com/maptalks.plotsymbol/dist/maptalks.plotsymbol.min.js"></script>
<script>
    var drawTool = new maptalks.DrawTool({
        mode: 'DoubleArrow'

        symbol : {
            'lineColor' : '#e84',
            'polygonFill' : '#f00',
            'polygonOpacity' : 0.5,
        }
    }).addTo(map).disable();
    drawTool.on('drawend', function (param) {
        //Add geometry to a VectorLayer
    });
</script>
```

### ES6

```javascript
    //You just need to import it, and then you can draw geometries by a drawtool.
    import plotsymbol from 'maptalks.plotsymbol';
    const drawTool = new maptalks.DrawTool({
        mode: 'Point',
        symbol : {
            'lineColor' : '#e84',
            'polygonFill' : '#f00',
            'polygonOpacity' : 0.5,
        }
    }).addTo(map).disable();
    //You can set many modes like DoubleArrow, ClosedCurve, Sector, DiagonalArrow, StraightArrow and so on.
    drawTool.setMode('DoubleArrow');
    drawTool.on('drawend', function (param) {
        //Add geometry to a VectorLayer
    });

```

### StraightArrow 自定义设置箭头

参数介绍

| 参数名         | 作用描述                                 | 默认值   | 备注                            |
| ----------- | ------------------------------------ | ----- | ----------------------------- |
| `lineRatio` | 箭头头部相对线宽的缩放比例，用于计算箭头头部大小。            | `1`   | 数值越大，箭头头部越大；越小，头部越小。          |
| `f1`        | 箭头头部宽度的第一级比例因子，控制箭头“头部三角形”左右宽度的扩展幅度。 | `0.8` | 控制箭头尖端边缘的宽度影响。                |
| `f2`        | 箭头头部宽度的第二级比例因子，用于箭头内部细节“颈部”部分的宽度控制。  | `1.4` | 使箭头头部有层次感和弧度，值越大颈部越宽。         |
| `hScale1`   | 箭头头部向外突出（尖端前伸）的长度比例因子，影响箭头头部的前端尖锐度。  | `2.2` | 控制箭头尖端“拉长”的程度，数值越大尖端越长越尖锐。    |
| `hScale2`   | 箭头头部内层细节的缩放比例，控制头部内部“颈部”部分的弧度大小。     | `0.7` | 影响箭头内部弯曲细节，使头部更平滑自然。          |
| `h1h2Ratio` | 箭头头部控制点相对于箭尾两个端点距离的比例，控制箭头头部的弯曲延伸程度。 | `2.3` | 用于计算控制点到箭尾的延长距离，值越大箭头头部越长越突出。 |
