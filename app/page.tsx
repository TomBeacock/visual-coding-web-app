import Icon from "./components/icon";
import { DockLayout } from "./components/dock-layout"
import { DockLayoutData } from "./components/dock-data";
import "./visual-coding.scss";

export default function Home() {
  const layout = {
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
                  tabInner: <><Icon name="storage" />Global Variables</>,
                  tabContent: <span>Global variables here</span>,
                }
              ]
            },
            {
              type: "panel",
              children: [
                {
                  tabInner: <><Icon name="functions" />Functions</>,
                  tabContent: <span>Functions here</span>,
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
                  tabInner: <><Icon name="account_tree" />Graph</>,
                  tabContent: <span>Graph here</span>,
                }
              ]
            },
            {
              type: "panel",
              children: [
                {
                  tabInner: <><Icon name="output" />Output</>,
                  tabContent: (<><span>Output here</span></>),
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
                  tabInner: <><Icon name="storage" />Local Variables</>,
                  tabContent: <span>Local variables here</span>,
                }
              ]
            },
            {
              type: "panel",
              children: [
                {
                  tabInner: <><Icon name="list" />Details</>,
                  tabContent: <span>Details here</span>,
                }
              ]
            },
          ]
        }
      ]
    },
  } as DockLayoutData;

  return (
    <div className="grid grid-rows-[auto_minmax(0,_1fr)] h-screen">
      <header className="p-2">
        <h1 className="font-bold text-xl">Visual Coding</h1>
      </header>
      <main className="px-2 pb-2">
        <DockLayout layout={layout} />
      </main>
    </div>
  );
}
