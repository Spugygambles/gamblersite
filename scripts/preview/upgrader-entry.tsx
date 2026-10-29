// The preview's copy of the Upgrader: the real game, bundled by esbuild with
// React and mounted over the page's snapshot (see mount.tsx).
import Upgrader from "@/components/upgrader/Upgrader";
import { mount } from "./mount";

mount("[data-upgrader-root]", <Upgrader />);
