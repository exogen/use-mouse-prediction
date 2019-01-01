import { useState, useEffect, useMemo } from "react";
import { linearRegression, linearRegressionLine } from "simple-statistics";
import useTimeout from "./useTimeout";

/**
 * Listen for mouse movements and return a prediction for where the mouse will
 * be at `predictOffset` milliseconds in the future.
 *
 * The returned prediction can be `null` if there is not enough data!
 */
export default function useMousePrediction({
  /**
   * Maximum age of samples in milliseconds (relative to the latest sample) to
   * consider before discarding them.
   */
  maxSampleAge = 150,
  /**
   * Number of milliseconds into the future (relative to the latest sample) at
   * which to predict the mouse position.
   */
  predictOffset = 300
} = {}) {
  const [points, setPoints] = useState([]);
  const [startExpiration] = useTimeout();

  useEffect(
    () => {
      const handleMove = event => {
        const { clientX: x, clientY: y, timeStamp: t } = event;
        setPoints(prevPoints => {
          const points = prevPoints.filter(point => {
            const age = t - point.t;
            // Some browsers without high precision timestamps can deliver
            // multiple events with the same timestamp, which is a problem for
            // linear regression if only such samples exist (the slope would be
            // infinite). The `age > 0` check ensures we only keep the latest
            // value for any given timestamp.
            return age > 0 && age <= maxSampleAge;
          });
          points.unshift({ x, y, t });
          return points;
        });
        // This expiration ensures that when the mouse stops moving, the
        // prediction updates to the latest mouse position after `maxSampleAge`
        // instead of persisting a prediction made when the mouse was moving.
        startExpiration(
          () => setPoints(points => points.slice(0, 1)),
          maxSampleAge
        );
      };
      window.addEventListener("mousemove", handleMove);
      return () => {
        window.removeEventListener("mousemove", handleMove);
      };
    },
    [maxSampleAge]
  );

  const prediction = useMemo(
    () => {
      const latestPoint = points[0];
      if (!latestPoint) {
        return null;
      } else if (points.length === 1) {
        return { ...latestPoint, r: 0 };
      }
      const xSamples = points.map(point => [point.t, point.x]);
      const ySamples = points.map(point => [point.t, point.y]);
      const xLine = linearRegressionLine(linearRegression(xSamples));
      const yLine = linearRegressionLine(linearRegression(ySamples));
      const t = latestPoint.t + predictOffset;
      const x = xLine(t);
      const y = yLine(t);
      // TODO: Adjust error/radius so more distant predictions have less
      // certainty (a wider radius).
      const r = 10;
      return { x, y, t, r };
    },
    [points, predictOffset]
  );

  return prediction;
}
