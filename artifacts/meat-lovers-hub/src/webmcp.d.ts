/**
 * WebMCP Pro v3.0 — HTML attribute type declarations
 *
 * Extends React's intrinsic element types so JSX accepts the WebMCP
 * declarative layer attributes (toolname, tooldescription) on any element.
 */

import "react";

declare module "react" {
  interface HTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
  }
}
