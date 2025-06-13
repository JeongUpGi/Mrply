declare module 'react-native-actionsheet' {
  import {Component} from 'react';

  interface ActionSheetProps {
    title?: string;
    message?: string;
    options?: string[];
    cancelButtonIndex?: number;
    destructiveButtonIndex?: number;
    onPress?: (index: number) => void;
    tintColor?: string;
    styles?: any;
  }

  export default class ActionSheet extends Component<ActionSheetProps> {
    show: () => void;
  }
}
