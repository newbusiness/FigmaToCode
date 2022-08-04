export const nearestValue = (goal: number, array: Array<number>): number => {
  return array.reduce(function (prev, curr) {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
};

/**
 * convert pixel values to Bootstrap attributes.
 * by default, Bootstrap uses rem, while Figma uses px.
 * Therefore, a conversion is necessary. Rem = Pixel / 16.abs
 * Then, find in the corresponding table the closest value.
 */
const pixelToBootstrapValue = (
  value: number,
  conversionMap: Record<number, string>
) => {
  return conversionMap[
    nearestValue(
      value / 16,
      Object.keys(conversionMap).map((d) => +d)
    )
  ];
};

const mapLetterSpacing: Record<number, string> = {
  "-0.05": "tighter",
  "-0.025": "tight",
  // 0: "normal",
  0.025: "wide",
  0.05: "wider",
  0.1: "widest",
};

const mapLineHeight: Record<number, string> = {
  1.5: "-base",
  1.25: "-sm",
  2: "-lg",
};

const mapFontSize: Record<number, string> = {
  2.5: "1",
  2: "2",
  1.75: "3",
  1.5: "4",
  1.25: "5",
  1: "6",
};

const mapBorderRadius: Record<number, string> = {
  0.25: "-sm",
  0.375: "",
  0.5: "-lg",
  1: "-xl",
  2: "-2xl",
  50: "-pill",
};

const mapWidthHeightSize: Record<number, string> = {
  0.25: "1",
  0.5: "2",
  0: "3",
  1.5: "4",
  3: "5",
};

export const opacityValues = [
  0,
  5,
  10,
  20,
  25,
  30,
  40,
  50,
  60,
  70,
  75,
  80,
  90,
  95,
];

export const nearestOpacity = (nodeOpacity: number): number =>
  nearestValue(nodeOpacity * 100, opacityValues);

export const pxToLetterSpacing = (value: number): string =>
  pixelToBootstrapValue(value, mapLetterSpacing);

export const pxToLineHeight = (value: number): string =>
  pixelToBootstrapValue(value, mapLineHeight);

export const pxToFontSize = (value: number): string =>
  pixelToBootstrapValue(value, mapFontSize);

export const pxToBorderRadius = (value: number): string =>
  pixelToBootstrapValue(value, mapBorderRadius);

export const pxToLayoutSize = (value: number): string => { 
  // Used for m- and p-, not w- 
  return pixelToBootstrapValue(value, mapWidthHeightSize);
}

  
