// The preview's copy of Coinflip: the real game, bundled by esbuild with
// React and mounted over the page's snapshot (see mount.tsx).
import Coinflip from "@/components/coinflip/Coinflip";
import { mount } from "./mount";

mount("[data-coinflip-root]", <Coinflip />);
