// The preview's copy of Keno: the real game, bundled by esbuild with React
// and mounted over the page's snapshot (see mount.tsx).
import Keno from "@/components/keno/Keno";
import { mount } from "./mount";

mount("[data-keno-root]", <Keno />);
