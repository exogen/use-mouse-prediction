import React, { useRef } from "react";
import Head from "next/head";
import circleIntersectsBox from "intersects/circle-box";
import useMousePrediction from "../src";

export default function DemoPage() {
  const targetRef = useRef();
  const prediction = useMousePrediction();

  let intersects = false;
  if (prediction) {
    // TODO: Compute rect less often (resize or intersection observer?)
    const rect = targetRef.current.getBoundingClientRect();
    intersects = circleIntersectsBox(
      prediction.x,
      prediction.y,
      prediction.r,
      rect.x,
      rect.y,
      rect.width,
      rect.height
    );
  }

  return (
    <main>
      <Head>
        <title>use-mouse-prediction</title>
      </Head>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background: rgb(79, 178, 250);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
            "Segoe UI Symbol";
        }
      `}</style>
      <style jsx>{`
        main {
          display: flex;
          min-height: 100vh;
          align-items: stretch;
        }

        svg {
          width: 100%;
          margin: 0;
          padding: 0;
          border: 0;
        }
      `}</style>
      <svg>
        <rect
          ref={targetRef}
          x={200}
          y={200}
          width={100}
          height={200}
          fill={intersects ? "rgb(20, 255, 213)" : "rgb(202, 246, 245)"}
        />
        {prediction ? (
          <circle
            cx={prediction.x}
            cy={prediction.y}
            r={prediction.r}
            fill="yellow"
          />
        ) : null}
      </svg>
    </main>
  );
}
