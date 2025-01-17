import { AltSceneNode } from "../../altNodes/altMixins";
import { pxToLayoutSize } from "../conversionTables";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";
import { formatWithJSX } from "../../common/parseJSX";


export const bootstrapSize = (node: AltSceneNode): string => {
  return bootstrapSizePartial(node).join("");
};

export const bootstrapSizePartial = (node: AltSceneNode): [string, string] => {
  const size = nodeWidthHeight(node, true);

  let w = "";
  if (typeof size.width === "number") {
    w += `w-${pxToLayoutSize(size.width)} `;
  } /*else if (typeof size.width === "string") {
    if (
      size.width === "full" &&
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "HORIZONTAL"
    ) {
      w += `flex-1 `;
    } else {
      w += `w-${size.width} `;
    }
  }*/

  let h = "";
  // console.log("sizeResults is ", sizeResult, node);

  if (typeof size.height === "number") {
    h = `h-${pxToLayoutSize(size.height)} `;
  } /*else if (typeof size.height === "string") {
    if (
      size.height === "full" &&
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "VERTICAL"
    ) {
      //h += `flex-1 `;
    } else {
      h += `h-${size.height} `;
    }
  }*/

  return [w, h];
};

/**
 * https://www.w3schools.com/css/css_dimension.asp
 */

export const htmlSizeForBootstrap = (
  node: AltSceneNode,
  isJSX: boolean
): string => {
  return htmlSizePartialForBootstrap(node, isJSX).join("");
};

export const htmlSizePartialForBootstrap = (
  node: AltSceneNode,
  isJSX: boolean
): [string, string] => {
  return [
    formatWithJSX("width", isJSX, node.width),
    formatWithJSX("height", isJSX, node.height),
  ];
};
