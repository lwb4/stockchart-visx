import React, { useEffect, useState, useMemo } from 'react';
import { Group } from '@visx/group';
import { AreaClosed } from '@visx/shape';
import { AxisLeft, AxisBottom, AxisScale } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';
import appleStock, { AppleStock } from '@visx/mock-data/lib/mocks/appleStock';
import type { TransformMatrix } from '@visx/zoom/lib/types';
import { scaleTime, scaleLinear } from '@visx/scale';
import { max, extent } from 'd3-array';

// Initialize some variables
const stock = appleStock.slice(1000);
const axisColor = '#fff';
const axisBottomTickLabelProps = {
  textAnchor: 'middle' as const,
  fontFamily: 'Arial',
  fontSize: 10,
  fill: axisColor,
};
const axisLeftTickLabelProps = {
  dx: '-0.25em',
  dy: '0.25em',
  fontFamily: 'Arial',
  fontSize: 10,
  textAnchor: 'end' as const,
  fill: axisColor,
};

// accessors
const getDate = (d: AppleStock) => new Date(d.date);
const getStockValue = (d: AppleStock) => d.close;

export default function AreaChart({
  gradientColor,
  width,
  yMax,
  xMax,
  margin,
  hideBottomAxis = false,
  hideLeftAxis = false,
  top,
  left,
  transformMatrix,
  scaleFactor,
  children,
}: {
  gradientColor: string;
  width: number;
  height: number;
  yMax: number;
  xMax: number;
  margin: { top: number; right: number; bottom: number; left: number };
  hideBottomAxis?: boolean;
  hideLeftAxis?: boolean;
  top?: number;
  left?: number;
  transformMatrix: TransformMatrix;
  scaleFactor: number;
  children?: React.ReactNode;
}) {
  const [filteredStock, setFilteredStock] = useState(stock.slice(stock.length - 50, stock.length));

  const dateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xMax],
        domain: extent(filteredStock, getDate) as [Date, Date],
      }),
    [xMax, filteredStock],
  );
  const stockScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, max(filteredStock, getStockValue) || 0],
        nice: true,
      }),
    [yMax, filteredStock],
  );

  useEffect(() => {
    console.log(transformMatrix)
    const { translateX } = transformMatrix;
    const end = Math.min(Math.max(stock.length - Math.floor(translateX / scaleFactor), 50), stock.length);
    const stockCopy = stock.slice(end - 50, end);
    setFilteredStock(stockCopy);
  }, [transformMatrix])
  
  if (width < 10) return null;

  return (
    <Group left={left || margin.left} top={top || margin.top}>
      <LinearGradient
        id="gradient"
        from={gradientColor}
        fromOpacity={1}
        to={gradientColor}
        toOpacity={0.2}
      />
      <AreaClosed<AppleStock>
        data={filteredStock}
        x={(d) => dateScale(getDate(d)) || 0}
        y={(d) => stockScale(getStockValue(d)) || 0}
        yScale={stockScale}
        strokeWidth={1}
        stroke="url(#gradient)"
        fill="url(#gradient)"
        curve={curveMonotoneX}
      />
      {!hideBottomAxis && (
        <AxisBottom
          top={yMax}
          scale={dateScale}
          numTicks={width > 520 ? 10 : 5}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={() => axisBottomTickLabelProps}
        />
      )}
      {!hideLeftAxis && (
        <AxisLeft
          scale={stockScale}
          numTicks={5}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={() => axisLeftTickLabelProps}
        />
      )}
      {children}
    </Group>
  );
}
