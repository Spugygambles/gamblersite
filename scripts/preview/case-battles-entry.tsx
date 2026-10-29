// The preview's copy of Case Battles: the real game, bundled by esbuild with
// React and mounted over the page's snapshot (see mount.tsx).
import CaseBattles from "@/components/battles/CaseBattles";
import { mount } from "./mount";

mount("[data-battles-root]", <CaseBattles />);
