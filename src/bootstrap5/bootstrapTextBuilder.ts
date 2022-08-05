import { commonLineHeight } from "./../common/commonTextHeightSpacing";
import { AltTextNode } from "../altNodes/altMixins";
import {
  pxToLetterSpacing,
  pxToLineHeight,
  pxToFontSize,
} from "./conversionTables";
import { BootstrapDefaultBuilder } from "./bootstrapDefaultBuilder";
import { commonLetterSpacing } from "../common/commonTextHeightSpacing";

export class BootstrapTextBuilder extends BootstrapDefaultBuilder {
  constructor(node: AltTextNode, showLayerName: boolean, optIsJSX: boolean) {
    super(node, showLayerName, optIsJSX);
  }

  // must be called before Position method
  textAutoSize(node: AltTextNode): this {
    if (node.textAutoResize === "NONE") {
      // going to be used for position
      this.hasFixedSize = true;
    }

    this.widthHeight(node);

    return this;
  }

  tryGetGlobalStyleFromFont(thisStyle: AltTextNode) {
    const textStyles = figma.getLocalTextStyles(); // this gets styles with names .. e.g. "desktop-h1"

    //console.log("Looking for match for:" + thisStyle.name + ", got " + textStyles.length + " inbuilt styles to check against");
    const searchId = thisStyle.textStyleId;
    for (let i = 0; i < textStyles.length; i++) {
      //console.log(style.name + ": " +style.description + ", " + style.id + ", incoming: ", thisStyle.textStyleId)
      const style = textStyles[i];
      const thisId = style.id;
      if (thisId === searchId) {
        const name = style.name
          .toLowerCase()
          .replace("mobile/", "") // sorry, specific to our implementation of "Desktop/H1", or "Mobile/H1"
          .replace("desktop/", "")
          .replace("body", "")
          .replace("bold", "fw-bold")
          .trim(); 

        //console.log(`Got matching font ${name}`);
        
        return name;
      }
    }
    return "";
  }

  // todo fontFamily
  //  fontFamily(node: AltTextNode): this {
  //    return this;
  //  }

  /**
   * https://getbootstrap.com/docs/5.2/utilities/text/
   * example: text-md
   */
  fontSize(node: AltTextNode): this {

    // example: text-md
    if (node.fontSize !== figma.mixed) {
      const value = pxToFontSize(node.fontSize);
      if (value != "")
        this.attributes += `fs-${value} `;
    }
    return this;
  }

  fontSizeCustom(node: AltTextNode): this {
    // example: text-md
    if (node.fontName !== figma.mixed) {

      // Look for matching 
      const matchedStyleName = this.tryGetGlobalStyleFromFont(node);
      if (matchedStyleName === "") {
        this.attributes += this.fontStyleText(node);
      }
      else {
        this.attributes = `${matchedStyleName} `;
      }
      //const value = pxToFontSize(node.fontSize);
      //this.attributes += `fs-px-${node.fontSize.toString()} fs-bs-${value} `;
      //this.attributes += `fn-${node.fontName.family.toLowerCase().replace(' ','-')} fspx-${node.fontSize.toString()} `;
    }

    return this;
  }

  /**
   * https://getbootstrap.com/docs/5.2/utilities/text/
   * example: fw-bold, fw-bolder, fst-italic
   */

  fontStyle(node: AltTextNode): this {
    this.attributes += this.fontStyleText(node);
    return this;
  }

  fontStyleText(node: AltTextNode): string {
    if (node.fontName !== figma.mixed) {
      let lowercaseStyle = node.fontName.style.toLowerCase();

      if (lowercaseStyle.match("italic")) {
        this.attributes += "fst-italic ";
      }

      // Note that fonts have "ExtraBold", "SemiBold", "Lite"
      lowercaseStyle = lowercaseStyle
        .replace("italic", "")
        .replace("medium", "")
        .replace("regular", "")
        .replace("standard", "")
        .replace(" ", "")
        .replace("bold", "bold")
        .replace("extrabold", "bold");

      if (lowercaseStyle !== "")
        return `fw-${lowercaseStyle} `;
    }
    return "";
  }

  /*
   *   NOT USED 
   */
  letterSpacing(node: AltTextNode): this {
    const letterSpacing = commonLetterSpacing(node);
    if (letterSpacing > 0) {
      //const value = pxToLetterSpacing(letterSpacing);
      //this.attributes += `tracking-${value} `;
    }

    return this;
  }

  /**
   *   NOT USED 
   * example: leading-3
   */
  lineHeight(node: AltTextNode): this {
    const lineHeight = commonLineHeight(node);
    if (lineHeight > 0) {
      //const value = pxToLineHeight(lineHeight);
      //this.attributes += `lh-${value} `;
    }

    return this;
  }

  /**
   * https://bootstrapcss.com/docs/text-align/
   * example: text-justify
   */
  textAlign(node: AltTextNode): this {
    // if alignHorizontal is LEFT, don't do anything because that is native

    // only undefined in testing
    if (node.textAlignHorizontal && node.textAlignHorizontal !== "LEFT") {
      // todo when node.textAutoResize === "WIDTH_AND_HEIGHT" and there is no \n in the text, this can be ignored.
      switch (node.textAlignHorizontal) {
        case "CENTER":
          this.attributes += `text-center `;
          break;
        case "RIGHT":
          this.attributes += `text-right `;
          break;
        case "JUSTIFIED":
          this.attributes += `text-justify `;
          break;
      }
    }

    return this;
  }

  /**
   * example: uppercase
   */
  textTransform(node: AltTextNode): this {
    if (node.textCase === "LOWER") {
      this.attributes += "lowercase ";
    } else if (node.textCase === "TITLE") {
      this.attributes += "capitalize ";
    } else if (node.textCase === "UPPER") {
      this.attributes += "uppercase ";
    } else if (node.textCase === "ORIGINAL") {
      // default, ignore
    }

    return this;
  }

  /**
   * example: underline
   */
  textDecoration(node: AltTextNode): this {
    if (node.textDecoration === "UNDERLINE") {
      this.attributes += "underline ";
    } else if (node.textDecoration === "STRIKETHROUGH") {
      this.attributes += "line-through ";
    }

    return this;
  }

  reset(): void {
    this.attributes = "";
  }
}
