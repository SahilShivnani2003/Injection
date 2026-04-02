import { TabParamList } from "../navigation/TabNavigator";

export interface ITabItem {
    name: keyof TabParamList;
    label: string;
    icon: string;
    iconOff: string;
    center?: boolean;
}