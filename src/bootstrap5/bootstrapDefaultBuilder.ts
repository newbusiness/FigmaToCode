import { bootstrapShadow } from "./builderImpl/bootstrapShadow";
import {
  AltSceneNode,
  AltGeometryMixin,
  AltBlendMixin,
  AltFrameMixin,
  AltDefaultShapeMixin,
} from "../altNodes/altMixins";
import {
  bootstrapVisibility,
  bootstrapRotation,
  bootstrapOpacity,
} from "./builderImpl/bootstrapBlend";
import {
  bootstrapBorderWidth,
  bootstrapBorderRadius,
} from "./builderImpl/bootstrapBorder";
import { bootstrapPosition } from "./builderImpl/bootstrapPosition";
import {
  bootstrapColorFromFills,
  bootstrapGradientFromFills,
} from "./builderImpl/bootstrapColor";
import {
  htmlSizeForBootstrap,
  htmlSizePartialForBootstrap,
  bootstrapSizePartial,
} from "./builderImpl/bootstrapSize";
import { bootstrapPadding } from "./builderImpl/bootstrapPadding";
import { formatWithJSX } from "../common/parseJSX";
import { parentCoordinates } from "../common/parentCoordinates";

export class BootstrapDefaultBuilder {
  attributes: string = "";
  style: string;
  styleSeparator: string = "";
  isJSX: boolean;
  visible: boolean;
  name: string = "";
  hasFixedSize = false;

  constructor(node: AltSceneNode, showLayerName: boolean, optIsJSX: boolean) {
    this.isJSX = optIsJSX;
    this.styleSeparator = this.isJSX ? "," : ";";
    this.style = "";
    this.visible = node.visible;

    if (showLayerName) {
      this.name = node.name.toLowerCase().replace(" ", "-").replace("/", "-") + " ";
    }
  }

  blend(node: AltSceneNode): this {
    this.attributes += bootstrapVisibility(node);
    this.attributes += bootstrapRotation(node);
    this.attributes += bootstrapOpacity(node);

    return this;
  }

  border(node: AltGeometryMixin & AltSceneNode): this {
    this.attributes += bootstrapBorderWidth(node);
    this.attributes += bootstrapBorderRadius(node);
    this.customColor(node.strokes, "border");

    return this;
  }

  position(
    node: AltSceneNode,
    parentId: string,
    isRelative: boolean = false
  ): this {
    const position = bootstrapPosition(node, parentId, this.hasFixedSize);

    if (position === "absoluteManualLayout" && node.parent) {
      // bootstrap can't deal with absolute layouts.

      const [parentX, parentY] = parentCoordinates(node.parent);

      const left = node.x - parentX;
      const top = node.y - parentY;

      this.style += formatWithJSX("left", this.isJSX, left);
      this.style += formatWithJSX("top", this.isJSX, top);

      if (!isRelative) {
        this.attributes += "absolute ";
      }
    } else {
      this.attributes += position;
    }

    return this;
  }

  /**
   * https://bootstrapcss.com/docs/text-color/
   * example: text-blue-500
   * example: text-opacity-25
   * example: bg-blue-500
   */
  customColor(
    paint: ReadonlyArray<Paint> | PluginAPI["mixed"],
    kind: string
  ): this {
    // visible is true or undefinied (tests)
    if (this.visible !== false) {
      let gradient = "";
      if (kind === "bg") {
        gradient = bootstrapGradientFromFills(paint);
      }
      if (gradient) {
        this.attributes += gradient;
      } else {
        this.attributes += bootstrapColorFromFills(paint, kind);
      }
    }
    return this;
  }

  /**
   * https://bootstrapcss.com/docs/box-shadow/
   * example: shadow
   */
  shadow(node: AltBlendMixin): this {
    this.attributes += bootstrapShadow(node);
    return this;
  }

  // must be called before Position, because of the hasFixedSize attribute.
  widthHeight(node: AltSceneNode): this {
    // if current element is relative (therefore, children are absolute)
    // or current element is one of the absoltue children and has a width or height > w/h-64

    if ("isRelative" in node && node.isRelative === true) {
      this.style += htmlSizeForBootstrap(node, this.isJSX);
    } else if (
      node.parent?.isRelative === true ||
      node.width > 384 ||
      node.height > 384
    ) {
      // to avoid mixing html and bootstrap sizing too much, only use html sizing when absolutely necessary.
      // therefore, if only one attribute is larger than 256, only use the html size in there.
      const [bootstrapWidth, bootstrapHeight] = bootstrapSizePartial(node);
      const [htmlWidth, htmlHeight] = htmlSizePartialForBootstrap(
        node,
        this.isJSX
      );

      // when textAutoResize is NONE or WIDTH_AND_HEIGHT, it has a defined width.
      if (node.type !== "TEXT" || node.textAutoResize !== "WIDTH_AND_HEIGHT") {
        if (node.width > 384) {
          this.style += htmlWidth;
        } else {
          this.attributes += bootstrapWidth;
        }

        this.hasFixedSize = htmlWidth !== "";
      }

      // when textAutoResize is NONE has a defined height.
      if (node.type !== "TEXT" || node.textAutoResize === "NONE") {
        if (node.width > 384) {
          this.style += htmlHeight;
        } else {
          this.attributes += bootstrapHeight;
        }

        this.hasFixedSize = htmlHeight !== "";
      }
    } else {
      const partial = bootstrapSizePartial(node);

      // Width
      if (node.type !== "TEXT" || node.textAutoResize !== "WIDTH_AND_HEIGHT") {
        this.attributes += partial[0];
      }

      // Height
      if (node.type !== "TEXT" || node.textAutoResize === "NONE") {
        this.attributes += partial[1];
      }

      this.hasFixedSize = partial[0] !== "" && partial[1] !== "";
    }
    return this;
  }

  autoLayoutPadding(node: AltFrameMixin | AltDefaultShapeMixin): this {
    this.attributes += bootstrapPadding(node);
    return this;
  }

  removeTrailingSpace(): this {
    if (this.attributes.length > 0 && this.attributes.slice(-1) === " ") {
      this.attributes = this.attributes.slice(0, -1);
    }

    if (this.style.length > 0 && this.style.slice(-1) === " ") {
      this.style = this.style.slice(0, -1);
    }
    return this;
  }

  build(additionalAttr: string = ""): string {
    this.attributes = additionalAttr + this.attributes;
    this.removeTrailingSpace();

    if (this.style) {
      if (this.isJSX) {
        this.style = ` style={{${this.style}}}`;
      } else {
        this.style = ` style="${this.style}"`;
      }
    }

    if (!this.attributes && !this.style && this.name !== "") {
      return "";
    }    

    const classOrClassName = this.isJSX ? "className" : "class";
    let r = ` ${classOrClassName}="${this.attributes}"${this.style}`;

    const n = this.name.trim().toLowerCase();
    if(n !== "") {
      // exclude standard names
      var exclude = 
        n == "button" 
        || n == "value" 
        || n == "observation"
        || n.startsWith("frame")
        || n.startsWith("0")
        || n.startsWith("1")
        || n.startsWith("2")
        || n.startsWith("3")
        || n.startsWith("4")
        || n.startsWith("5")
        || n.startsWith("6")
        || n.startsWith("7")
        || n.startsWith("8")
        || n.startsWith("9")
        || n.startsWith("%")
        || n.startsWith("_");

      if(!exclude)
        r += ` name="${n}"`;
    }
    
    return r;
  }

  reset(): void {
    this.attributes = "";
  }
}
