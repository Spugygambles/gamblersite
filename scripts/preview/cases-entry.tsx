// The preview's copy of case opening: the real page, bundled by esbuild
// with React and mounted over the page's snapshot (see mount.tsx).
import CaseOpening from "@/components/cases/CaseOpening";
import { mount } from "./mount";

mount("[data-cases-root]", <CaseOpening />);
