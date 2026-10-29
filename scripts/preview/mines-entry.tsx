// The preview's copy of Mines: the real game, bundled by esbuild with React
// and mounted over the page's snapshot (see mount.tsx).
import MinesGame from "@/components/mines/MinesGame";
import { mount } from "./mount";

mount("[data-mines-root]", <MinesGame />);
