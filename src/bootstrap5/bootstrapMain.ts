import { indentString } from "./../common/indentString";
import {
  AltFrameNode,
  AltSceneNode,
  AltRectangleNode,
  AltEllipseNode,
  AltTextNode,
  AltGroupNode,
} from "../altNodes/altMixins";
import { pxToLayoutSize } from "./conversionTables";
import { bootstrapVector } from "./vector";
import { BootstrapTextBuilder } from "./bootstrapTextBuilder";
import { BootstrapDefaultBuilder } from "./bootstrapDefaultBuilder";
import { retrieveTopFill } from "../common/retrieveFill";

let parentId = "";
let showLayerName = false;
let minimalExport = true; // just divs etc

const selfClosingTags = ["img"];

export const bootstrapMain = (
  sceneNode: Array<AltSceneNode>,
  parentIdSrc: string = "",
  isJsx: boolean = false,
  layerName: boolean = false
): string => {
  parentId = parentIdSrc;
  showLayerName = layerName;

  // Repurpose isJsx to minimalExport
  minimalExport = isJsx;
  isJsx = false;

  let result = bootstrapWidgetGenerator(sceneNode, isJsx);

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.slice(0, 1) === "\n") {
    result = result.slice(1, result.length);
  }

  return result;
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const bootstrapWidgetGenerator = (
  sceneNode: ReadonlyArray<AltSceneNode>,
  isJsx: boolean
): string => {
  let comp = "";

  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const visibleSceneNode = sceneNode.filter((d) => d.visible !== false);

  visibleSceneNode.forEach((node) => {
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
      comp += bootstrapContainer(
        node,
        "",
        "",
        { isRelative: false, isInput: false },
        isJsx
      );
    } else if (node.type === "GROUP") {
      comp += bootstrapGroup(node, isJsx);
    } else if (node.type === "FRAME") {
      comp += bootstrapFrame(node, isJsx);
    } else if (node.type === "TEXT") {
      comp += bootstrapText(node, false, isJsx);
    }
    //console.log(node.type + " returned " + comp.substring(0,10) +"..." );

  });

  return comp;
};

const bootstrapGroup = (node: AltGroupNode, isJsx: boolean = false): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width <= 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  const vectorIfExists = bootstrapVector(node, showLayerName, parentId, isJsx);
  if (vectorIfExists) return vectorIfExists;

  // this needs to be called after CustomNode because widthHeight depends on it
  let builder = new BootstrapDefaultBuilder(node, showLayerName, isJsx);
  if(!minimalExport) {
    builder = builder
      .blend(node)
      .widthHeight(node)
      .position(node, parentId);
  }

  const generator = bootstrapWidgetGenerator(node.children, isJsx);

  if ((builder.attributes || builder.style) && !minimalExport) {
    const attr = builder.build("relative ");
    return `\n<div${attr}>${indentString(generator)}\n</div>`;
  }

  return generator;
};

const bootstrapText = (
  node: AltTextNode,
  isInput: boolean,
  isJsx: boolean
): string | [string, string] => {
  // follow the website order, to make it easier

  let builderResult = new BootstrapTextBuilder(node, showLayerName, isJsx)
    .fontSizeCustom(node);

  if(!minimalExport) {
    builderResult = builderResult
      .blend(node)
      .textAutoSize(node)
      .position(node, parentId)
      // todo fontFamily (via node.fontName !== figma.mixed ? `fontFamily: ${node.fontName.family}`)
      // todo font smoothing
      .fontSize(node)
      .fontStyle(node)
      .letterSpacing(node)
      .lineHeight(node)
      .textDecoration(node)
      // todo text lists (<li>)
      .textAlign(node)
      .customColor(node.fills, "text")
      .textTransform(node);
  }

  const splittedChars = node.characters.split("\n");
  const charsWithLineBreak =
    splittedChars.length > 1
      ? node.characters.split("\n").join("<br/>")
      : node.characters;

  if (isInput) {
    return [builderResult.attributes, charsWithLineBreak];
  } else {
    return `\n<p${builderResult.build()}>${charsWithLineBreak}</p>`;
  }
};

const bootstrapFrame = (node: AltFrameNode, isJsx: boolean): string => {
  // const vectorIfExists = bootstrapVector(node, isJsx);
  // if (vectorIfExists) return vectorIfExists;

  if (
    node.children.length === 1 &&
    node.children[0].type === "TEXT" &&
    node?.name?.toLowerCase().match("input")
  ) {
    const [attr, char] = bootstrapText(node.children[0], true, isJsx);
    return bootstrapContainer(
      node,
      ` placeholder="${char}"`,
      attr,
      { isRelative: false, isInput: true },
      isJsx
    );
  }

  const childrenStr = bootstrapWidgetGenerator(node.children, isJsx);

  if (node.layoutMode !== "NONE") {
    const rowColumn = rowColumnProps(node);
    return bootstrapContainer(
      node,
      childrenStr,
      rowColumn,
      { isRelative: false, isInput: false },
      isJsx
    );
  } 
  
  // node.layoutMode === "NONE" && node.children.length > 1
  // children needs to be absolute
  return bootstrapContainer(
    node,
    childrenStr,
    "relative ",
    { isRelative: true, isInput: false },
    isJsx
  );
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const bootstrapContainer = (
  node: AltFrameNode | AltRectangleNode | AltEllipseNode,
  children: string,
  additionalAttr: string,
  attr: {
    isRelative: boolean;
    isInput: boolean;
  },
  isJsx: boolean
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return children;
  }

  let builder;

  if(minimalExport) {
    builder = new BootstrapDefaultBuilder(node, showLayerName, isJsx);
  }
  else {
    builder = new BootstrapDefaultBuilder(node, showLayerName, isJsx)
      .blend(node)
      .widthHeight(node)
      .autoLayoutPadding(node)
      .position(node, parentId, attr.isRelative)
      .customColor(node.fills, "bg")
      .shadow(node)
      .border(node);
  }

  if (attr.isInput) {
    // children before the > is not a typo.
    return `\n<input${builder.build(additionalAttr)}${children}></input>`;
  }

  if (builder.attributes || additionalAttr) {
    const build = builder.build(additionalAttr);

    // image fill and no children -- let's emit an <img />
    let tag = "div";
    let src = "";
    if (retrieveTopFill(node.fills)?.type === "IMAGE") {
      tag = "img";
      src = ` src="https://via.placeholder.com/${node.width}x${node.height}"`;
    }

    if (children) {
      return `\n<${tag}${build}${src}>${indentString(children)}\n</${tag}>`;
    } else if (selfClosingTags.includes(tag) || isJsx) {
      return `\n<${tag}${build}${src} />`;
    } else {
      return `\n<${tag}${build}${src}></${tag}>`;
    }
  }

  return children;
};

export const rowColumnProps = (node: AltFrameNode): string => {
  // ROW or COLUMN

  // ignore align etc, when node has only one child 
  if (node.children.length <= 1) {
    //return `this-${node.type} child-${node.children[0].type}`;
    return '.';
  }

  const rowOrColumn = node.layoutMode === "HORIZONTAL" ? "d-flex " : "d-flex flex-column "; 

  // space between items
  const spacing = node.itemSpacing > 0 ? pxToLayoutSize(node.itemSpacing) : 0;
  const spaceDirection = node.layoutMode === "HORIZONTAL" ? "x" : "y";

  // space is visually ignored when there is only one child or spacing is zero
  let space = "";
  if(node.children.length > 1 && spacing > 0) {
    space = node.layoutMode === "HORIZONTAL" ? `mx-${spacing} ` : `gap-${spacing} `;
  }

  // special case when there is only one children; need to position correctly in Flex.
  // let justify = "justify-center";
  // if (node.children.length === 1) {
  //   const nodeCenteredPosX = node.children[0].x + node.children[0].width / 2;
  //   const parentCenteredPosX = node.width / 2;

  //   const marginX = nodeCenteredPosX - parentCenteredPosX;

  //   // allow a small threshold
  //   if (marginX < -4) {
  //     justify = "justify-start";
  //   } else if (marginX > 4) {
  //     justify = "justify-end";
  //   }
  // }
  //
  //    figma.getLocalPaintStyles().where(a=>a.id=fillStyleId).name (=Black/100),  (Black/60)
  //    
  let primaryAlign: string = "";
  let counterAlign: string = "";

  // figma.getStyleById(node.fillStyleId)
  //console.log(node);

  if(!minimalExport) {
    switch (node.primaryAxisAlignItems) {
      case "MIN":
        //primaryAlign = "justify-content-start ";  // default
        break;
      case "CENTER":
        primaryAlign = "justify-content-center ";
        break;
      case "MAX":
        primaryAlign = "justify-content-end ";
        break;
      case "SPACE_BETWEEN":
        primaryAlign = "justify-content-between ";
        break;
    }

    switch (node.counterAxisAlignItems) {
      case "MIN":
        //counterAlign = "align-items-start ";  // default
        break;
      case "CENTER":
        counterAlign = "align-items-center ";
        break;
      case "MAX":
        counterAlign = "align-items-end ";
        break;
    }
  }

  // [optimization]
  // when all children are STRETCH and layout is Vertical, align won't matter. Otherwise, center it.
  // const layoutAlign =
  //   node.layoutMode === "VERTICAL" &&
  //   node.children.every((d) => d.layoutAlign === "STRETCH")
  //     ? ""
  //     : `items-center ${justify} `;

  // if parent is a Frame with AutoLayout set to Vertical, the current node should expand
  /*let flex =
    node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === node.layoutMode
      ? "d-flex "
      : "d-inline-flex ";*/
    
  const r = `${rowOrColumn}${space}${counterAlign}${primaryAlign}`;
  if(r.trim() === "") return ".";
  return r;
  //return `${flex}${rowOrColumn}${space}${counterAlign}${primaryAlign} children-${node.children.length} child-type-${node.children[0].type}`;
};
