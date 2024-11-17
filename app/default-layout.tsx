import { DockLayoutData } from "./components/dock-layout/dock-data";
import {
  IconFunction,
  IconListDetails,
  IconSitemap,
  IconTerminal,
  IconVariable
} from "@tabler/icons-react";
import { SectionGraph } from "./components/sections/section-graph";

const tabIconProps = {
  stroke: 1.5,
}

export const defaultLayout = {
  root: {
    type: "box",
    direction: "row",
    children: [
      {
        type: "box",
        direction: "column",
        children: [
          {
            type: "panel",
            children: [
              {
                icon: <IconVariable {...tabIconProps} />,
                label: "Global Variables",
                content: <span>Global variables here</span>,
              }
            ]
          },
          {
            type: "panel",
            children: [
              {
                icon: <IconFunction {...tabIconProps} />,
                label: "Functions",
                content: <span>Functions here</span>,
              }
            ]
          },
        ]
      },
      {
        type: "box",
        direction: "column",
        weight: 4,
        children: [
          {
            type: "panel",
            weight: 4,
            children: [
              {
                icon: <IconSitemap {...tabIconProps} />,
                label: "Graph",
                content: <SectionGraph />,
              }
            ]
          },
          {
            type: "panel",
            children: [
              {
                icon: <IconTerminal {...tabIconProps} />,
                label: "Output",
                content: (<><span>Output here</span></>),
              }
            ]
          },
        ]
      },
      {
        type: "box",
        direction: "column",
        children: [
          {
            type: "panel",
            children: [
              {
                icon: <IconVariable {...tabIconProps} />,
                label: "Local Variables",
                content: <span>Local variables here</span>,
              }
            ]
          },
          {
            type: "panel",
            children: [
              {
                icon: <IconListDetails {...tabIconProps} />,
                label: "Details",
                content: <span>Details here</span>,
              }
            ]
          },
        ]
      }
    ]
  },
} as DockLayoutData;