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
      if(value != "")
        this.attributes += `fs-${value} `;
    }

    return this;
  }

  fontSizeCustom(node: AltTextNode): this {
    // example: text-md
    if (node.fontName !== figma.mixed) {
      // ==> fn-plus-jakarta sans fs-12 fw-medium
      this.attributes += this.fontStyleText(node);
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
        .replace("bold","bold")
        .replace("extrabold","bold");

        if(lowercaseStyle !== "")
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
