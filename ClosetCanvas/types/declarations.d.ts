declare module "*.svg" {
  import * as React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  declare module 'react-native-masonry-list' {
  import { ComponentType } from 'react';
  const MasonryList: ComponentType<any>;
  export default MasonryList;
}
  export default content;
}
