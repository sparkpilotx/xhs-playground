import { ProxyAgent, setGlobalDispatcher } from "undici";

/** Set a global Undici dispatcher to a fixed proxy (hardcoded as requested). */
export function enableUndiciDispatcher() {
  const dispatcher = new ProxyAgent({
    uri: "http://simon:aVeryStr0ngP%40ssw0rd%21@129.226.193.37:80",
  });
  setGlobalDispatcher(dispatcher);
}
