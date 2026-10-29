// The preview's copy of Limbo: the real game, bundled by esbuild with React
// and mounted over the page's snapshot (see mount.tsx).
import Limbo from "@/components/limbo/Limbo";
import { mount } from "./mount";

mount("[data-limbo-root]", <Limbo />);
