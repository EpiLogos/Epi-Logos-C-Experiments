/**
 * Coordinate: M' M3' (Level-0 Fibonacci Ground outer ring)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): 0
 * Actualises: [[Fibonacci Ground]] as the outer envelope of the M3 cosmic wheel.
 * Public surface: M3FibonacciGroundRing, M3FibonacciGroundViewModel.
 * Does NOT own: Pisano digits, Sun-to-ground projection, or backbone degrees.
 * Contract: [[M3'-SPEC]] section 8.0; rerun tranche 24.T24.19.
 */

const CARDINAL_POSITIONS = [0, 15, 30, 45] as const;
const ZODIACAL_POSITIONS = [5, 10, 20, 25, 35, 40, 50, 55] as const;

export interface M3FibonacciGroundWedge {
    readonly position: number;
    readonly digit: number;
}

export interface M3FibonacciGroundViewModel {
    readonly wedges: readonly M3FibonacciGroundWedge[];
    readonly backboneDegrees: readonly number[];
    readonly natalSunPosition: number | null;
    readonly liveSunPosition: number | null;
}

interface M3FibonacciGroundRingProps {
    readonly ground: M3FibonacciGroundViewModel;
    readonly center: number;
    readonly size: number;
    readonly showDigits: boolean;
}

function point(center: number, radius: number, degree: number): readonly [number, number] {
    const angle = ((degree - 90) * Math.PI) / 180;
    return [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius];
}

function wedgePath(
    center: number,
    position: number,
    innerRadius: number,
    outerRadius: number
): string {
    const start = position * 6;
    const end = start + 6;
    const [outerStartX, outerStartY] = point(center, outerRadius, start);
    const [outerEndX, outerEndY] = point(center, outerRadius, end);
    const [innerEndX, innerEndY] = point(center, innerRadius, end);
    const [innerStartX, innerStartY] = point(center, innerRadius, start);
    return [
        `M ${outerStartX} ${outerStartY}`,
        `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEndX} ${outerEndY}`,
        `L ${innerEndX} ${innerEndY}`,
        `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStartX} ${innerStartY}`,
        'Z'
    ].join(' ');
}

function markerPoint(
    center: number,
    radius: number,
    position: number
): readonly [number, number] {
    return point(center, radius, position * 6 + 3);
}

export function M3FibonacciGroundRing({
    ground,
    center,
    size,
    showDigits
}: M3FibonacciGroundRingProps) {
    const outerRadius = size * 0.485;
    const innerRadius = size * 0.405;
    const digitRadius = size * 0.445;
    const anchorRadius = size * 0.39;
    const backboneOuterRadius = size * 0.395;
    const backboneInnerRadius = size * 0.365;

    return (
        <g
            data-testid="m3-fibonacci-ground-ring"
            data-layer-order="fibonacci-ground,backbone,lens-annulus,walk,torus-core"
        >
            <g aria-label="60 backend-authored Fibonacci Ground wedges">
                {ground.wedges.map(wedge => {
                    const [labelX, labelY] = markerPoint(
                        center,
                        digitRadius,
                        wedge.position
                    );
                    return (
                        <g
                            key={wedge.position}
                            data-testid={`m3-fibonacci-wedge-${wedge.position}`}
                            data-position={wedge.position}
                            data-digit={wedge.digit}
                        >
                            <path
                                d={wedgePath(
                                    center,
                                    wedge.position,
                                    innerRadius,
                                    outerRadius
                                )}
                                className="m3-fibonacci-wedge"
                            />
                            {showDigits ? (
                                <text
                                    x={labelX}
                                    y={labelY}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="m3-fibonacci-digit"
                                >
                                    {wedge.digit}
                                </text>
                            ) : null}
                        </g>
                    );
                })}
            </g>

            {CARDINAL_POSITIONS.map(position => {
                const [cx, cy] = markerPoint(center, anchorRadius, position);
                return (
                    <circle
                        key={position}
                        data-testid={`m3-fibonacci-cardinal-${position}`}
                        cx={cx}
                        cy={cy}
                        r={size * 0.012}
                        className="m3-fibonacci-cardinal"
                    />
                );
            })}

            {ZODIACAL_POSITIONS.map(position => {
                const [cx, cy] = markerPoint(center, anchorRadius, position);
                return (
                    <circle
                        key={position}
                        data-testid={`m3-fibonacci-zodiacal-${position}`}
                        cx={cx}
                        cy={cy}
                        r={size * 0.009}
                        className="m3-fibonacci-zodiacal"
                    />
                );
            })}

            {ground.backboneDegrees.map((degree, index) => {
                const [x1, y1] = point(center, backboneInnerRadius, degree);
                const [x2, y2] = point(center, backboneOuterRadius, degree);
                return (
                    <line
                        key={index}
                        data-testid={`m3-fibonacci-backbone-${index}`}
                        data-degree={degree}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        className={
                            index === 0
                                ? 'm3-fibonacci-backbone m3-fibonacci-backbone-origin'
                                : 'm3-fibonacci-backbone'
                        }
                    />
                );
            })}

            {ground.natalSunPosition !== null
                ? (() => {
                      const [cx, cy] = markerPoint(
                          center,
                          outerRadius,
                          ground.natalSunPosition
                      );
                      return (
                          <circle
                              data-testid="m3-fibonacci-natal-sun"
                              data-position={ground.natalSunPosition}
                              cx={cx}
                              cy={cy}
                              r={size * 0.017}
                              className="m3-fibonacci-natal-sun"
                          />
                      );
                  })()
                : null}

            {ground.liveSunPosition !== null
                ? (() => {
                      const [cx, cy] = markerPoint(
                          center,
                          outerRadius,
                          ground.liveSunPosition
                      );
                      return (
                          <circle
                              data-testid="m3-fibonacci-live-sun"
                              data-position={ground.liveSunPosition}
                              cx={cx}
                              cy={cy}
                              r={size * 0.011}
                              className="m3-fibonacci-live-sun"
                          />
                      );
                  })()
                : null}
        </g>
    );
}
